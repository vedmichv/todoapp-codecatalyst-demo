import { Context, APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { randomBytes } from 'crypto';
import { CorsAPIGatewayProxyResult } from './CorsAPIGatewayProxyResult';
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

    let payload: Todo;
    try {
      payload = JSON.parse(event!.body!);
      if(!payload.title) {
        throw new Error('Missing title');
      }
    } catch(error) {
      return new CorsAPIGatewayProxyResult(400, { message: (error as Error).message });
    }
    const datetime = new Date();

    payload.id = randomBytes(16).toString('hex');
    payload.created_at = datetime.toISOString();
    payload.completed = false;
    
    let params = {
        TableName: tableName,
        Item: payload,
    };
    await dynamoDB.put(params).promise();
    return new CorsAPIGatewayProxyResult(201, payload);
  } catch (error) {
    logger.error('Failed addTodo', error as Error);
    return new CorsAPIGatewayProxyResult(500, { message: (error as Error).message });
  }
};

export const lambdaHandler = middy(handler)
    .use(injectLambdaContext(logger, { logEvent: true }))
    .use(captureLambdaHandler(tracer, {captureResponse: true}))
    .use(logMetrics(metrics, { captureColdStartMetric: true }));