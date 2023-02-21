import { Context, APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
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

    if (!event.body || !event.pathParameters?.id) {
      return {
        statusCode: 400,
        body: JSON.stringify({message: 'Invalid request'}),
      };
    }

    if (!tableName) {
      throw new Error('Table name missing');
    }

    let payload: Todo = JSON.parse(event.body);
    if (payload.title || payload.completed !== undefined || payload.description) {
      let params = {
        TableName: tableName,
        Key: {
          id: event.pathParameters.id,
        },
        ExpressionAttributeValues: {
          ':c': payload.completed,
          ':n': payload.title,
          ':d': payload.description,
        },
        UpdateExpression: buildUpdateExpression(payload),
        ReturnValues: 'ALL_NEW',
      };
      const data = await dynamoDB.update(params).promise();
      console.log(JSON.stringify(data));
      return {
        statusCode: 200,
        body: JSON.stringify(data.Attributes),
      };
    }
    return {
        statusCode: 400,
        body: JSON.stringify({message: 'Nothing to update'}),
      };
  } catch (error) {
    console.error(`Error: ${error}`);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: (error as Error).message }),
    };
  }
};
function buildUpdateExpression(payload: Todo) {
  let updateExpression = 'set ';
  if (payload.title) {
    updateExpression += 'title = :n, ';
  }
  if (payload.completed !== undefined) {
    updateExpression += 'completed = :c, ';
  }
    if (payload.description) {
        updateExpression += 'description = :d, ';
    }
    
  return updateExpression.substring(0, updateExpression.length - 2);
}

export const lambdaHandler = middy(handler)
    .use(injectLambdaContext(logger, { logEvent: true }))
    .use(captureLambdaHandler(tracer, {captureResponse: true}))
    .use(logMetrics(metrics, { captureColdStartMetric: true }));