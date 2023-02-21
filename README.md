## Project overview

This project is a "To Do" single-page application.  It is meant to be extensible after creation to meet your team's requirements.

## Architecture overview

This project is composed of 2 main components: 
* the Backend that expose a REST CRUD API to manage ToDo items
* the Frontend that expose a Web Interface interacting with the REST API

### Backend

The ToDo backend is deployed as a RESTful API using AWS Serverless technologies:
- [AWS API Gateway](https://aws.amazon.com/api-gateway) to provide the REST interface to the persistence layer
- [Amazon DynamoDB](https://aws.amazon.com/dynamodb) for list persistence
- [AWS Lambda](https://aws.amazon.com/lambda) provides the glue between the two.

The [AWS Cloud Development Kit (CDK)](https://aws.amazon.com/cdk) provides the infrastructure-as-code used to deploy to a live AWS environment.  You can find all of the above under the '/backend' folder in the CodeCatalyst repository.

The code in the `backend` folder includes unit test cases that can be run using your development environment.  All code artifacts in the backend folder can be extended to meet your needs.

Deployment instruction can be found in the [backend/README.md](./backend/README.md) file.

### Frontend

The frontend application is based on [ReactJS 17](https://reactjs.org) and TypeScript. The user interface uses [CloudScape](https://cloudscape.design) components and stylesheets.

The frontend is built and deployed using AWS CDK.  The deployment includes Amazon S3+CloudFront

The build pipeline runs unit and integration tests on the frontend and backend, and produces testing reports.  Failed tests will stop the artifacts from publishing.  Front end code is compiled and optimized for production deployment. The [Amazon CloudFront](https://aws.amazon.com/cloudfront) content delivery network is used to pull both the frontend and backend together under a single logical internet-accessible domain under the AWS account that is connected.  Amazon Cloudfront provides HTTPS support for the domain as well as forward caching for the front-end.


Deployment instruction can be found in the [frontend/README.md](./frontend/README.md) file.

## Connections and permissions

The `"To Do" single-page application` supports the Amazon CodeCatalyst Development Role, which can be created from the [AWS management console Codecatalyst application](https://us-west-2.console.aws.amazon.com/codecatalyst/home?region=us-west-2#/). When clicking “add IAM role”, the first option is to create a CodeCatalyst development role. After clicking create, the role will be automatically added to the Amazon CodeCatalyst space. 

The other option is creating a application specific IAM role, which can be added to the Amazon CodeCatalyst space by selecting "Add an existing IAM role" from the add IAM role options. The IAM role needs to contain the CodeCatalyst trust policy, as well as the following permissions:

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "cloudformation:*",
                "ssm:*",
                "s3:*",
                "iam:PassRole",
                "iam:GetRole",
                "iam:CreateRole",
                "iam:AttachRolePolicy",
                "iam:PutRolePolicy"
            ],
            "Resource": "*"
        }
    ]
}
```

The IAM roles also require the Amazon CodeCatalyst service principals `codecatalyst.amazonaws.com` and `codecatalyst-runner.amazonaws.com`.

### Required IAM role trust policy:

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "",
            "Effect": "Allow",
            "Principal": {
                "Service": [
                    "codecatalyst.amazonaws.com",
                    "codecatalyst-runner.amazonaws.com"
                ]
            },
            "Action": "sts:AssumeRole"
        }
    ]
}
```

## Project details

### Resources
The following resources have been generated and initial revisions can be modified
- CodeCatalyst workflows defined in ``.codecatalyst/workflows/``
- Backend business logic under `/backend/lambda`
- Backend unit/e2e test cases under `/backend/test`
- Backend CDK stack definitions under `/backend/bin` and `/backend/lib`
- Frontend project under `/frontend`
- Frontend IaC under `/frontend/cdk`

### Deployment environment

This project will deploy the following AWS resources after being successfuly created. The deployment status can be viewed in the project's workflow:

- Amazon DynamoDB table based on input name
- Amazon Lambda functions to handle backend transactions
- Amazon API Gateway REST API with given name
- Amazon S3 bucket for storing compiled frontend artifacts
- A single Amazon CloudFront distribution with origins for Frontend and Backend (`/api`)



### Cleaning up resources

1. Clean up deployed infrastructure
    1. Set credentials locally to access linked AWS Account
    1. Trigger the destruction of resources using AWS CDK CLI running `cdk destroy` from each project subfolders (`backend` and `frontend/cdk`)
1. Clean CodeCatalyst project by going to **Project settings** and click **Delete project**



### Adding a resource to your application

This project leverage AWS CDK and therfore can easily be extended by updating AWS CDK code.

## Additional resources

See the Amazon CodeCatalyst user guide for additional information on using the features and resources of Amazon CodeCatalyst.
