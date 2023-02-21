import * as AWSMock from 'aws-sdk-mock';
import * as AWS from 'aws-sdk';
import { Todo } from '../../../lambda/Todo';
import { lambdaHandler } from '../../../lambda/updateTodo';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { PutItemInput, PutItemOutput } from '@aws-sdk/client-dynamodb';
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
  AWSMock.mock('DynamoDB.DocumentClient', 'update', (params: PutItemInput, callback: Function) => {
    console.log('DynamoDB.DocumentClient', 'update', 'mock called');
    callback(null, {Attributes: todo});
  });
});

afterEach(() => {
  AWSMock.restore('DynamoDB.DocumentClient');
});

describe('updateTodo', () => {
  it('should return the updated todo item', async () => {
    // GIVEN
    process.env.DDB_TABLE = 'testTable';

    const event: APIGatewayProxyEvent = {
      pathParameters: {
        id: todo.id,
      },
      body: JSON.stringify(todo),
    } as any;

    // WHEN

    const result = await lambdaHandler(event, ContextExamples.helloworldContext);

    // THEN
    expect(result.statusCode).toEqual(200);
    expect(JSON.parse(result.body).title).toEqual(todo.title);
  });
  it('should return 500 if DDB_TABLE not set', async () => {
    // GIVEN
    delete process.env.DDB_TABLE;

    const event: APIGatewayProxyEvent = {
      pathParameters: {
        id: '1',
      },
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
    expect(result.body).toContain('Table name missing');
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
    expect(result.body).toEqual(JSON.stringify({ message: 'Invalid request' }));
  });
});
