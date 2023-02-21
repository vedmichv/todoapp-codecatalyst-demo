import { CfnOutput, Stack, StackProps, Aws } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as nodejsfunction from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';

export interface TodoApiStackProps extends StackProps {
  readonly allowedOrigins?: string;
};
export const ApiGatewayEndpointStackOutput = 'ApiEndpoint';
export const ApiGatewayDomainStackOutput = 'ApiDomain';
export const ApiGatewayStageStackOutput = 'ApiStage';

export class TodoApiStack extends Stack {
  constructor(scope: Construct, id: string, props?: TodoApiStackProps) {
    super(scope, id, props);

    const ddb = new dynamodb.Table(this, 'TodosDB', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
    });

    const getTodos = createFunction(this, 'getTodos', ddb, props?.allowedOrigins);
    ddb.grantReadData(getTodos);

    const getTodo = createFunction(this, 'getTodo', ddb, props?.allowedOrigins);
    ddb.grantReadData(getTodo);

    const addTodo = createFunction(this, 'addTodo', ddb, props?.allowedOrigins);
    ddb.grantWriteData(addTodo);

    const deleteTodo = createFunction(this, 'deleteTodo', ddb, props?.allowedOrigins);
    ddb.grantWriteData(deleteTodo);

    const updateTodo = createFunction(this, 'updateTodo', ddb, props?.allowedOrigins);
    ddb.grantWriteData(updateTodo);

    const apiGateway = new apigateway.RestApi(this, 'ApiGateway', {
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
      deployOptions: {
        tracingEnabled: true,
      },
    });
    const api = apiGateway.root.addResource('api');

    const todos = api.addResource('todos', {
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });
   
    todos.addMethod('GET', new apigateway.LambdaIntegration(getTodos));
    todos.addMethod('POST', new apigateway.LambdaIntegration(addTodo));

    const todoId = todos.addResource('{id}',{
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });
    todoId.addMethod('PUT', new apigateway.LambdaIntegration(updateTodo));
    todoId.addMethod('GET', new apigateway.LambdaIntegration(getTodo));
    todoId.addMethod('DELETE', new apigateway.LambdaIntegration(deleteTodo));

    // export apigateway endpoint
    new CfnOutput(this, ApiGatewayEndpointStackOutput, {
      value: apiGateway.url
    });

    new CfnOutput(this, ApiGatewayDomainStackOutput, {
      value: apiGateway.url.split('/')[2]
    });

    new CfnOutput(this, ApiGatewayStageStackOutput, {
      value: apiGateway.deploymentStage.stageName
    });
  }
}
function createFunction(scope: Construct, name: string, ddb: dynamodb.Table, allowedOrigins?: string) {
  return  new nodejsfunction.NodejsFunction(scope, name, {
    runtime: lambda.Runtime.NODEJS_16_X,
    entry: path.join(__dirname, `../lambda/${name}.ts`),
    handler: 'lambdaHandler',
    bundling: {
      externalModules: [
        '@aws-lambda-powertools/commons',
        '@aws-lambda-powertools/logger',
        '@aws-lambda-powertools/metrics',
        '@aws-lambda-powertools/tracer',
      ],
    },
    environment: {
      DDB_TABLE: ddb.tableName,
      ALLOWED_ORIGINS: allowedOrigins || '*',
      POWERTOOLS_SERVICE_NAME: name,
      POWERTOOLS_METRICS_NAMESPACE: 'todoApp',
    },
    layers: [
      lambda.LayerVersion.fromLayerVersionArn(
        scope, `PowertoolsLayer-${name}`, `arn:aws:lambda:${Aws.REGION}:094274105915:layer:AWSLambdaPowertoolsTypeScript:4`
      )
    ],
    tracing: lambda.Tracing.ACTIVE,
});
}
