import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as ToDoApiStack from '../../../lib/todo-api-stack';

// example test. To run these tests, uncomment this file along with the
// example resource in lib/ts-lambda-stack.ts
test('Check Resource Created', () => {
  const app = new cdk.App();
    // WHEN
  const stack = new ToDoApiStack.TodoApiStack(app, 'UnitTestStack');
    // THEN
  const template = Template.fromStack(stack);

  template.resourceCountIs("AWS::Lambda::Function", 5);
  template.resourceCountIs("AWS::DynamoDB::Table", 1);
  template.resourceCountIs("AWS::ApiGateway::RestApi", 1);
});
