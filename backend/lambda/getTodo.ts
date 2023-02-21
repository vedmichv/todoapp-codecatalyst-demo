import { Context, APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CorsAPIGatewayProxyResult } from './CorsAPIGatewayProxyResult';
import { DynamoDB } from 'aws-sdk';

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

    // Check if table name is set
    if (!tableName) {
      throw new Error('Table name missing');
    }

    console.log(`Table name: ${tableName}`);

    if (!event?.pathParameters?.id) {
      return new CorsAPIGatewayProxyResult(400, { message: 'Missing id' });
    }
    let params = {
      TableName: tableName,
      Key: {
        id: event!.pathParameters!.id,
      },
    };

    const data = await dynamoDB.get(params).promise();
    return new CorsAPIGatewayProxyResult(200, data.Item);
  } catch (error) {
    logger.error('Failed getTodo', error as Error);
    return new CorsAPIGatewayProxyResult(500, {message: (error as Error).message});
  }
};

export const lambdaHandler = middy(handler)
    .use(injectLambdaContext(logger, { logEvent: true }))
    .use(captureLambdaHandler(tracer, {captureResponse: true}))
    .use(logMetrics(metrics, { captureColdStartMetric: true }));
