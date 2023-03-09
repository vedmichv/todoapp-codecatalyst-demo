

## Demo application overview

This project is a "To Do" single-page application.  It is meant to be extensible after creation to meet your team's requirements.



### Architecture overview

![App overview](./readme-img/build-app-1.png)

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
We are done with prerequistes and ready to start building!


## Step 1 - Code: Creating a To Do Web Application project.

1. In the [CodeCatalyst console]((https://us-west-2.console.aws.amazon.com/codecatalyst/home?region=us-west-2#/)), navigate to the space where you want to create a project and click **Create project** button at the top.
2. Keep selection **Start with a blueprint** and choose *To Do web application*. You can use seach functionality to search blueprints by name. Click **Next**. 
3. Enter the **Project Name**: *todoapp-demo*, under **CDK Role** choose the IAM role you created in the Prerequisites section.
4. Expand **Frontend Options** and **Backend Options** and select *Python* in both sections. Click **Create Project**.

![Create Project](./readme-img/build-app-2.png)

## Step 2 - Initial Build & Deploy: CI/CD Workflow.

1. On the left pane expand **CI/CD** and click **Workflows**.
2. Under Recent runs, click on the run you initiated. It will take approximately 20 minutes to complete.You see green check marks next to each Action indicating completion. In the meantime, you can explore CI/CD defininition in YAML.
![Visual Workflow](./readme-img/build-app-3.png)

3. Once your application is deployed, go to **Variables** Tab and copy **AppURL**. Try to add items.
![Visual Workflow](./readme-img/build-app-4.png)

4. Add a couple of items and validate that your application is working
![To do app](./readme-img/build-app-5.png)

5. Open [AWS CloudFormation](https://us-west-2.console.aws.amazon.com/cloudformation/) and review resources that we created for your application. 
![CloudFormation Stacks](./readme-img/build-app-6.png) 

6. You can drill down to all the resources by selecting a stack.
![CloudFormation Resources](./readme-img/build-app-7.png) 

Let's make a change from the "To-Do App" to the "AWS Events App".

## Step 3 - Update & Deploy: Creating issues and launching Dev Environment.

1. Optional step: Invite a team member. In the navigation pane, choose **Project settings**, then select **Members** Tab. Click **Invite** button. Enter email address in the popup and click **Invite**.
2. In the navigation pane, choose **Issues**. Click **Create issue**. Provide required information and click **Create issue**.
![Create issue](./readme-img/build-app-8.png) 
3. Now let's address this issue. In the navigation pane, choose **Code**, then select **Dev Environments**. Click **Create Dev Environment**.
![Dev Environments](./readme-img/build-app-9.png) 
4. Select **AWS Cloud9 (in browser)**. Complete all the fields as on the screenshot below and click **Create**
![Cloud-9 Launch](./readme-img/build-app-10.png) 
5. In your Cloud9 IDE, expand *frontend* folder and update *App.tsx* file and make 2 updates change 1) "To-Do List" to "AWS Events" and 2) "Add To-Do Item" to "Add a new event"
![Cloud-9 App TSX](./readme-img/build-app-11.png)
6. Update file *index.html" to and replace "To-Do App" with "AWS Events App".
![Cloud-9 Index html](./readme-img/build-app-12.png)
7. Save changes. Click **Commit**, **Push**.
![Cloud-9 Commit](./readme-img/build-app-13.png)
8. In the navigation pane, choose **Source Repositaties**. Review recent commits. Click **Actions** and select **Create pull request**.
![Pull Request](./readme-img/build-app-14.png)
9. In the navigation pane, choose **Pull requests**. Review changes. Select *main* as Destination branch and click **Create** at the bottom.
![Pull Changes](./readme-img/build-app-15.png)
10. Click **Merge** button at the top. Keep default options and click **Merge**.
![Merge](./readme-img/build-app-17.png)
10. Validate that once Merge is initiated with *main*, CI/CD workflow starts running.
![CI/CD](./readme-img/build-app-18.png)
11. Check changes in the To-Do App.
![App Changes](./readme-img/build-app-19.png)

## Step 4 - Add  compute.

CodeCatalyst offers the following compute types:
-   Amazon EC2    
-   AWS Lambda
By default, workflow actions use the `Linux.x86-64.Large` on-demand fleet with an Amazon EC2 compute type. 
Let's add provisioned fleet compute and assing it for our workflows. 
1. Go to CI/CD area and chose Compute
![[compute-01.png]]
2. Define the name of the provisioned fleet, operating system, machine type, capacity and scalling mode. 
![[compute-02.png]]
3. As soon the fleet's status will be in `Active` mode, we can use it in our workflows. 
![[compute-03.png]]
4. Update workflow. As compute can be defined [on top level](https://docs.aws.amazon.com/codecatalyst/latest/userguide/workflow.top.level.html#compute-reference), we will update workflow to use the compute for all actions.  
	1. Back to main_fullstack_workflow and click edit 
	2. After `Triggers` section let's add the block. 

```yaml
Compute:
  Type: EC2
  Fleet: Fleet01	
```

![[compute-04.png]]
5. Workflow will automatically run use the trigger `PUSH` 
6. To check that we use that compute we can go to logs of run any action, for example `BackendTest` 
![[compute-05.png]]
7. Provisioned compute fleet can accelerate building process.
![[compute-06.png]]

## Step 5 – Add GitHub Actions.
You can use a GitHub Action alongside native CodeCatalyst actions in a CodeCatalyst workflow, that allow to add any github action from the [marketplace](https://github.com/marketplace?type=actions). Let's add [Super-Linter GitHub Action](https://github.com/marketplace/actions/super-linter) for our application. 
1. Go to workflows and edit it
2. The linter can be add on yaml and visual mode. 
	1. Visual mode:
	2. ![[githubactions-01.png]]
	3. ![[githubactions-02.png]]
3. Let's do the same but use `YAML` . Edit workflow and add the block: 
```yaml
  SuperLinterAction:
    Identifier: aws/github-actions-runner@v1
    Inputs:
      Sources:
        - WorkflowSource 
    Configuration:
      Steps:
        - name: Lint Code Base
          uses: github/super-linter@v4
          env:
            VALIDATE_ALL_CODEBASE: "true"
            DEFAULT_BRANCH: main
```
![[githubactions-03.png]]
4. Commit our changes. And after we see that the build is failed, linter found what we can impove in our code  ![[githubactions-04.png]]
5. Let update linter to scan only changes (new files), to achieve that we need to change the value of the parameter `VALIDATE_ALL_CODEBASE` to `false`. 
6. Edit workflow and change the value. ![[githubactions-05.png]]
7. On that time we see - linter is green and our build is sucsess. ![[githubactions-06.png]]
## Step 6 – Add secret.
We need to download third-party dependencies from private NPM, we have to authorize there. Let's add username as secret. 
1. Navigate to CI/CD section and open secret tab, and create new secret ![[secrets-01.png]]
2. Name is `NPMUSER` value is `TestUser01` ![[secrets-02.png]]
3. We can see our secret, and now the secret is ready to use on the workflow, to use the secret we should use reference ID of the secret: `${Secrets.NPMUSER}` ![[secrets-03.png]]
4. Let's test our secret 
5. 
## Step 7 – Test: Configure reports.

## Step 8 – Change tracking (monitor)


Monitor application or CI/CD process?

## Step X – Deploy ???

Here is _ 10. Validate that once Merge is initiated with *main*, CI/CD workflow starts running. _
![CI/CD](./readme-img/build-app-18.png)

We already should deploy the changes, on that step will we deploy changes from Infra perspective. 

## Step XX – Notifications to slack 



## Cleaning up resources

1. Clean CodeCatalyst project by going to **Project settings** and click **Delete project**. In the popup window type "delete" and click **Delete Project**.
![CodeCatalyst Delete](./readme-img/clean-up-1.png)

2. Clean up deployed infrastructure:

    2.1 Sign in to the AWS Management Console with the same account that you added to your space, and then choose AWS CloudFormation. You will see "TodoAppFrontendStack" and "TodoAppBackendStack". Select first the first one, and click "Delete". Repete with the second stack.
![CLoudformation Delete](./readme-img/clean-up-2.png)

    2.2 Validate that stacks have been successfully deleted.
![Stacks Deleted](./readme-img/clean-up-3.png)



### Adding a resource to your application

This project leverage AWS CDK and therfore can easily be extended by updating AWS CDK code.

## Additional resources

See the Amazon CodeCatalyst user guide for additional information on using the features and resources of Amazon CodeCatalyst.
