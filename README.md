

## Demo application overview

This project is a "To Do" single-page application.  It is meant to be extensible after creation to meet your team's requirements.


### Architecture overview

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



### Project details

#### Resources
The following resources have been generated and initial revisions can be modified
- CodeCatalyst workflows defined in ``.codecatalyst/workflows/``
- Backend business logic under `/backend/lambda`
- Backend unit/e2e test cases under `/backend/test`
- Backend CDK stack definitions under `/backend/bin` and `/backend/lib`
- Frontend project under `/frontend`
- Frontend IaC under `/frontend/cdk`

#### Deployment environment

This project will deploy the following AWS resources after being successfuly created. The deployment status can be viewed in the project's workflow:

- Amazon DynamoDB table based on input name
- Amazon Lambda functions to handle backend transactions
- Amazon API Gateway REST API with given name
- Amazon S3 bucket for storing compiled frontend artifacts
- A single Amazon CloudFront distribution with origins for Frontend and Backend (`/api`)


## Hands-On Build CI/CD Pipeline with CodeCatalyst

### Prerequisites

To follow along with this hands-on project, you will need:

1. Have an AWS Account where the application will be deployed. 
This project will be within [AWS Free Tier](https://aws.amazon.com/free/). If you don't have an AWS account you can follow [instructions](https://aws.amazon.com/premiumsupport/knowledge-center/create-and-activate-aws-account/) and create a new one.

2. Have an [AWS Builder ID](https://profile.aws.amazon.com/) for signing to CodeCatalyst. If you don't have an AWS Builder ID, you can create it during the sign up process for CodeCatalyst.
Please review the [Setting up CodeCatalyst](https://docs.aws.amazon.com/codecatalyst/latest/userguide/setting-up-topnode.html) process to learn more. 

If you are setting up AWS Builder ID and CodeCatalyst for the first time, please follow instrcutions in the section below.

#### Seting up CodeCatalyst with AWS Builder ID for the first time.

2.1. Open the [CodeCatalyst console](https://codecatalyst.aws/)
2.2. Click **Get started for free**.
2.3. Provide your personal email address and complete steps to sign up.
![AWS Builder ID](./readme-img/prereq-1.png)
2.4. Once AWS Builder is created, sign in to CodeCatalyst.
2.5. Provide **Alias**, **Space name**, **AWS account ID** and Click **Verify in the AWS console**.
2.6. Once AWS account is verified, Click **Create space**.
![Create Space](./readme-img/prereq-3.png)

3. Create a IAM role with required permissions for CodeCatalyst. For more information about the role and role policy, see [Creating a CodeCatalyst service role](https://docs.aws.amazon.com/codecatalyst/latest/userguide/ipa-iam-roles.html) or follow the section below.

#### Connections and permissions

3.1. Open [AWS CodeCatalyst Console](https://us-west-2.console.aws.amazon.com/codecatalyst/home?region=us-west-2#/) and select your space on the left pane. 
3.2 Click **Add IAM role**.  
![Create Space](./readme-img/prereq-4-iam.png)

- Choose the first option **Create CodeCatalyst Create CodeCatalyst development administrator role in IAM** and IAM role will be automatically created for you. Click **Create development role**.

- Alternatively you can select an existing IAM role by selecting "Add an existing IAM role" from the add IAM role options. The IAM role needs to contain the CodeCatalyst trust policy, as well as the following permissions:

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

Required IAM role trust policy:

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



### Creating a Project in CodeCatalyst.

1. 



### Cleaning up resources

1. Clean up deployed infrastructure
    1. Set credentials locally to access linked AWS Account
    1. Trigger the destruction of resources using AWS CDK CLI running `cdk destroy` from each project subfolders (`backend` and `frontend/cdk`)
1. Clean CodeCatalyst project by going to **Project settings** and click **Delete project**



### Adding a resource to your application

This project leverage AWS CDK and therfore can easily be extended by updating AWS CDK code.

## Additional resources

See the Amazon CodeCatalyst user guide for additional information on using the features and resources of Amazon CodeCatalyst.
