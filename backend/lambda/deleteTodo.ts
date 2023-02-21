import { Context, APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CorsAPIGatewayProxyResult } from './CorsAPIGatewayProxyResult';
import { DynamoDB, } from 'aws-sdk';

import { Logger, injectLambdaContext } from '@aws-lambda-powertools/logger';
import { Tracer, captureLambdaHandler } from '@aws-lambda-powertools/tracer';
import { Metrics, logMetrics } from '@aws-lambda-powertools/metrics';
import middy from '@middy/core';

const logger = new Logger();
const tracer = new Tracer();
const metrics = new Metrics();

const tableName = process.env.DDB_TABLE;
const dynamoDB = tracer.captureAWSClient(new DynamoDB.DocumentClient());

const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
    try {
        if (!tableName) {
            throw new Error('Table name missing');
        }

        if (!event.pathParameters?.id) {
            return new CorsAPIGatewayProxyResult(400, { message: 'Invalid request' });
        } else {
            let params = {
                TableName: tableName,
                Key: {
                    "id": event.pathParameters?.id
                }
            };
            await dynamoDB.delete(params).promise();
            return new CorsAPIGatewayProxyResult(204, { message: 'Success' });
        }       
    } catch (error) {
        return new CorsAPIGatewayProxyResult(500, error);
    }
};

export const lambdaHandler = middy(handler)
    .use(injectLambdaContext(logger, { logEvent: true }))
    .use(captureLambdaHandler(tracer, {captureResponse: true}))
    .use(logMetrics(metrics, { captureColdStartMetric: true }));