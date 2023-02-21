import * as AWSMock from 'aws-sdk-mock';
import * as AWS from 'aws-sdk';
import { Todo } from '../../../lambda/Todo';
import { lambdaHandler } from '../../../lambda/getTodo';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { GetItemInput } from '@aws-sdk/client-dynamodb';
import { ContextExamples } from '@aws-lambda-powertools/commons';

const todo: Todo = {
  id: '123',
  title: 'TestName',
  completed: false,
  description: 'TestDescription',
  created_at: '2022-10-06T17:51:05.143Z',
};

beforeEach(() => {
  AWSMock.setSDKInstance(AWS);
  AWSMock.mock('DynamoDB.DocumentClient', 'get', (params: GetItemInput, callback: Function) => {
    console.log('DynamoDB.DocumentClient', 'get', 'mock called');
    callback(null, { Item: todo });
  });
});

afterEach(() => {
  AWSMock.restore('DynamoDB.DocumentClient');
});

describe('getTodo', () => {
  it('should return an existing todo item', async () => {
    // GIVEN
    process.env.DDB_TABLE = 'testTable';

    const event: APIGatewayProxyEvent = {
      pathParameters: {
        id: '1',
      },
    } as any;

    // WHEN

    const result = await lambdaHandler(event, ContextExamples.helloworldContext);

    // THEN
    expect(result.statusCode).toEqual(200);
    expect(result.body).toEqual(JSON.stringify(todo));
  });
  it('should return 500 if DDB_TABLE not set', async () => {
    // GIVEN
    delete process.env.DDB_TABLE;

    const event: APIGatewayProxyEvent = {
      pathParameters: {
        id: '1',
      },
    } as any;

    // WHEN
    const result = await lambdaHandler(event, ContextExamples.helloworldContext);

    // THEN
    expect(result.statusCode).toEqual(500);
    expect(result.body).toEqual(JSON.stringify({ message: 'Table name missing' }));
  });

  it('should return 400 if Id not set', async () => {
    // GIVEN
    process.env.DDB_TABLE = 'testTable';

    const event: APIGatewayProxyEvent = {
    } as any;

    // WHEN
    const result = await lambdaHandler(event, ContextExamples.helloworldContext);

    // THEN
    expect(result.statusCode).toEqual(400);
    expect(result.body).toEqual(JSON.stringify({ message: 'Missing id' }));
  });
});
