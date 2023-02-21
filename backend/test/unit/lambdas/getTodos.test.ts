import * as AWSMock from 'aws-sdk-mock';
import * as AWS from 'aws-sdk';
import { Todo } from '../../../lambda/Todo';
import { lambdaHandler } from '../../../lambda/getTodos';
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
  AWSMock.mock('DynamoDB.DocumentClient', 'scan', (params: GetItemInput, callback: Function) => {
    console.log('DynamoDB.DocumentClient', 'scan', 'mock called');
    callback(null, { Items: [todo] });
  });
});

afterEach(() => {
  AWSMock.restore('DynamoDB.DocumentClient');
});

describe('getTodos', () => {
  it('should return all existing todos item', async () => {
    // GIVEN
    process.env.DDB_TABLE = 'testTable';

    const event: APIGatewayProxyEvent = {} as any;

    // WHEN

    const result = await lambdaHandler(event, ContextExamples.helloworldContext);

    // THEN
    expect(result.statusCode).toEqual(200);
    expect(result.body).toEqual(JSON.stringify([todo]));
  });
  it('should return 500 if DDB_TABLE not set', async () => {
    // GIVEN
    delete process.env.DDB_TABLE;

    const event: APIGatewayProxyEvent = {} as any;

    // WHEN
    const result = await lambdaHandler(event, ContextExamples.helloworldContext);

    // THEN
    expect(result.statusCode).toEqual(500);
    expect(result.body).toEqual(JSON.stringify({ message: 'Table name missing' }));
  });

});
