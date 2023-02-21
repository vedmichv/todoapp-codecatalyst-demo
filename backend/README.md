# Welcome to your Todo CRUD API project written in CDK TypeScript

This is a Todo CRUD API project written with CDK with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Prerequisite

1. Install dependencies
```
npm ci
```

1. Bootstrap AWS account
```
npm run cdk bootstrap
```

## Develop locally

1. Run unit test (optional)
```
npm run test
```

## Deploy to the cloud

1. Deploy
```
npm run cdk deploy
```

1. Run e2e tests
```
npm run test:integ
```

## CDK Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template
