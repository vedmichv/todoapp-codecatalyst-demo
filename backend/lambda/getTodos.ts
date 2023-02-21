import { Context, APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CorsAPIGatewayProxyResult } from './CorsAPIGatewayProxyResult';
import { DynamoDB } from 'aws-sdk';
import { Todo } from './Todo';

import { Logger, injectLambdaContext } from '@aws-lambda-powertools/logger';
import { Tracer, captureLambdaHandler } from '@aws-lambda-powertools/tracer';
import { Metrics, logMetrics } from '@aws-lambda-powertools/metrics';
import middy from '@middy/core';

const logger = new Logger();
const tracer = new Tracer();
const metrics = new Metrics();

const handler = async (event: APIGatewayEvent, context?: Context): Promise<APIGatewayProxyResult> => {
  try {

    const tableName = process.env.DDB_TABLE;

    const dynamoDB = tracer.captureAWSClient(new DynamoDB.DocumentClient());

    if (!tableName) {
      throw new Error('Table name missing');
    }

    let params: DynamoDB.DocumentClient.ScanInput = {
      TableName: tableName,
    };

    // Get all todos from dynamoDB following nextToken
    const todos: Todo[] = [];
    let nextToken: DynamoDB.DocumentClient.Key | undefined = undefined;
    do {
      if (nextToken) {
        params['ExclusiveStartKey'] = nextToken;
      }
      const data = await dynamoDB.scan(params).promise();
      logger.debug(`Data: ${JSON.stringify(data, null, 2)}`);
      if (data.Items) {
        todos.push(...(data.Items as Todo[]));
        logger.debug(`Todos: ${JSON.stringify(todos, null, 2)}`);
      }
      nextToken = data.LastEvaluatedKey;
    } while (nextToken);
    return new CorsAPIGatewayProxyResult(200, todos);
  } catch (error) {
    logger.error('Failed getTodos', error as Error);
    return new CorsAPIGatewayProxyResult(500, { message: (error as Error).message });
  }
};

export const lambdaHandler = middy(handler)
    .use(injectLambdaContext(logger, { logEvent: true }))
    .use(captureLambdaHandler(tracer, {captureResponse: true}))
    .use(logMetrics(metrics, { captureColdStartMetric: true }));