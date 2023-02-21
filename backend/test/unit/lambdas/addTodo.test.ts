import * as AWSMock from 'aws-sdk-mock';
import * as AWS from 'aws-sdk';
import { Todo } from '../../../lambda/Todo';
import { lambdaHandler } from '../../../lambda/addTodo';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { PutItemInput, PutItemOutput } from '@aws-sdk/client-dynamodb';
import { ContextExamples } from '@aws-lambda-powertools/commons';

const fakeContext = {
  awsRequestId: '1234567890',
  callbackWaitsForEmptyEventLoop: true,
  functionName: 'test',
  functionVersion: '1',
  invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789012:function:test',
  logGroupName: 'test',
  logStreamName: 'test',
  memoryLimitInMB: '128',
  getRemainingTimeInMillis: () => 1000,
  done: () => {},
  fail: () => {},
  succeed: () => {},
};

const todo: Todo = {
  id: '123',
  title: 'TestName',
  completed: false,
  description: 'TestDescription',
  created_at: '2022-10-06T17:51:05.143Z',
};

beforeEach(() => {
  AWSMock.setSDKInstance(AWS);
  AWSMock.mock('DynamoDB.DocumentClient', 'put', (params: PutItemInput, callback: Function) => {
    console.log('DynamoDB.DocumentClient', 'put', 'mock called');
    callback(null, { } as PutItemOutput);
  });
});

afterEach(() => {
  AWSMock.restore('DynamoDB.DocumentClient');
});

describe('addTodo', () => {
  it('should return the created todo item', async () => {
    // GIVEN
    process.env.DDB_TABLE = 'testTable';

    const event: APIGatewayProxyEvent = {
      body: JSON.stringify({
        title: todo.title,
        completed: todo.completed,
        description: todo.description,
      } as Todo),
    } as any;

    // WHEN

    const result = await lambdaHandler(event, ContextExamples.helloworldContext);

    // THEN
    expect(result.statusCode).toEqual(201);
    expect(JSON.parse(result.body).title).toEqual(todo.title);
    expect(result.headers!['Access-Control-Allow-Origin']).toEqual('*');
  });
  it('should return 500 if DDB_TABLE not set', async () => {
    // GIVEN
    delete process.env.DDB_TABLE;

    const event: APIGatewayProxyEvent = {
      body: JSON.stringify({
        title: todo.title,
        completed: todo.completed,
        description: todo.description,
      } as Todo),
    } as any;

    // WHEN
    const result = await lambdaHandler(event, ContextExamples.helloworldContext);

    // THEN
    expect(result.statusCode).toEqual(500);
    expect(result.body).toEqual(JSON.stringify({ message: 'Table name missing' }));
  });

  it('should return 400 if body not set', async () => {
    // GIVEN
    process.env.DDB_TABLE = 'testTable';

    const event: APIGatewayProxyEvent = {
    } as any;

    // WHEN
    const result = await lambdaHandler(event, ContextExamples.helloworldContext);

    // THEN
    expect(result.statusCode).toEqual(400);
    expect(result.body).toEqual(JSON.stringify({ message: 'Unexpected token u in JSON at position 0' }));
  });
});
