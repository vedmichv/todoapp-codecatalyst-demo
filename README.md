
## Demo application overview

This project is a "To Do" single-page application.  It is meant to be extensible after creation to meet your team's requirements.

### Architecture overview

![App overview](./readme-img/build-app-1.png)

This project is composed of 2 main components:

* the Backend that exposes a REST CRUD API to manage ToDo items
* the Frontend that exposes a Web Interface interacting with the REST API

### Backend

The ToDo backend is deployed as a RESTful API using AWS Serverless technologies:

* [AWS API Gateway](https://aws.amazon.com/api-gateway) to provide the REST interface to the persistence layer
* [Amazon DynamoDB](https://aws.amazon.com/dynamodb) for list persistence
* [AWS Lambda](https://aws.amazon.com/lambda) provides the glue between the two.

The [AWS Cloud Development Kit (CDK)](https://aws.amazon.com/cdk) provides the infrastructure-as-code used to deploy to a live AWS environment.  You can find all of the above under the '/backend' folder in the CodeCatalyst repository.

The code in the `backend` folder includes unit test cases that can be run using your development environment.  All code artifacts in the backend folder can be extended to meet your needs.

Deployment instructions can be found in the [backend/README.md](./backend/README.md) file.

### Frontend

The frontend application is based on [ReactJS 17](https://reactjs.org) and TypeScript. The user interface uses [CloudScape](https://cloudscape.design) components and stylesheets.

The frontend is built and deployed using AWS CDK.  The deployment includes Amazon S3+CloudFront

The build pipeline runs unit and integration tests on the frontend and backend, and produces testing reports.  Failed tests will stop the artifacts from publishing.  Front end code is compiled and optimized for production deployment. The [Amazon CloudFront](https://aws.amazon.com/cloudfront) content delivery network is used to pull both the frontend and backend together under a single logical internet-accessible domain under the AWS account that is connected.  Amazon Cloudfront provides HTTPS support for the domain as well as forward caching for the front-end.

Deployment instruction can be found in the [frontend/README.md](./frontend/README.md) file.

### Project details

#### Resources

The following resources have been generated and initial revisions can be modified

* CodeCatalyst workflows defined in ``.codecatalyst/workflows/``
* Backend business logic under `/backend/lambda`
* Backend unit/e2e test cases under `/backend/test`
* Backend CDK stack definitions under `/backend/bin` and `/backend/lib`
* Frontend project under `/frontend`
* Frontend IaC under `/frontend/cdk`

#### Deployment environment

This project will deploy the following AWS resources after being successfully created. The deployment status can be viewed in the project's workflow:

* Amazon DynamoDB table
* Amazon Lambda functions to handle backend transactions
* Amazon API Gateway REST API
* Amazon S3 bucket for storing compiled frontend artifacts
* A single Amazon CloudFront distribution with origins for Frontend and Backend (`/api`)

## Hands-On Build CI/CD Pipeline with CodeCatalyst

### Prerequisites

To follow along with this hands-on project, you will need:

1. Have an AWS Account where the application will be deployed.
This project will be within [AWS Free Tier](https://aws.amazon.com/free/). If you don't have an AWS account you can follow the [instructions](https://aws.amazon.com/premiumsupport/knowledge-center/create-and-activate-aws-account/) and create a new one.

2. Have an [AWS Builder ID](https://profile.aws.amazon.com/) for signing into CodeCatalyst. If you don't have an AWS Builder ID, you can create it during the sign-up process for CodeCatalyst.
Please review the [Setting up CodeCatalyst](https://docs.aws.amazon.com/codecatalyst/latest/userguide/setting-up-topnode.html) process to learn more.

If you are setting up AWS Builder ID and CodeCatalyst for the first time, please follow the instructions in the section below.

#### Setting up CodeCatalyst with AWS Builder ID for the first time

2.1. Open the [CodeCatalyst console](https://codecatalyst.aws/)

2.2. Click **Get started for free**.

2.3. Provide your personal email address and complete the steps to sign up.

![AWS Builder ID](./readme-img/prereq-1.png)

2.4. Once AWS Builder is created, sign in to CodeCatalyst.

2.5. Provide **Alias**, **Space name**, and **AWS account ID**. Click **Verify in the AWS console**.

2.6. Once the AWS account is verified, Click **Create space**.

![Create Space](./readme-img/prereq-3.png)

3. Create an IAM role with the required permissions for CodeCatalyst. For more information about the role and role policy, see [Creating a CodeCatalyst service role](https://docs.aws.amazon.com/codecatalyst/latest/userguide/ipa-iam-roles.html) or follow the section below.

#### Connections and permissions

3.1. Open [AWS CodeCatalyst Console](https://us-west-2.console.aws.amazon.com/codecatalyst/home?region=us-west-2#/) and select your space on the left pane.

3.2 Click **Add IAM role**.

![Create Space](./readme-img/prereq-4-iam.png)

* Choose the first option **Create CodeCatalyst development administrator role in IAM**, then Click **Create development role**.

* Alternatively, you can select an existing IAM role by selecting **Add an existing IAM role** from the add IAM role options. The IAM role needs to contain the CodeCatalyst trust policy, as well as the following permissions:

```json
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

```json
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

We are done with prerequisites and ready to start building!

## Step 1 - Code: Creating a To-Do Web Application project

1. In the [CodeCatalyst console]((<https://us-west-2.console.aws.amazon.com/codecatalyst/home?region=us-west-2#/>)), navigate to the space where you want to create a project and click **Create project** button at the top.
2. Keep selection **Start with a blueprint** and choose *To Do web application*. You can use search functionality to search blueprints by name. Click **Next**.
3. Enter the **Project Name**: *todoapp-demo*, under **CDK Role** choose the IAM role you created in the Prerequisites section.
4. Expand **Frontend Options** and **Backend Options** and select *Python* in both sections. Click **Create Project**.

![Create Project](./readme-img/build-app-2.png)

Also we should update the name of stackname for the backend and frontend stacks. This will help us to identify the stacks in the AWS CloudFormation console.

## Step 2 - Initial Build & Deploy: CI/CD Workflow

1. In the navigation pane, expand **CI/CD** and click **Workflows**.
2. Under Recent runs, click on the run you initiated. It will take approximately 20 minutes to complete. You see green check marks next to each Action indicating completion. In the meantime, you can explore CI/CD definition in YAML.
![Visual Workflow](./readme-img/build-app-3.png)

3. Once your application is deployed, go to **Variables** Tab and copy **AppURL**. Try to add items.
![Visual Workflow](./readme-img/build-app-4.png)

4. Add a few items and validate that your application is working.
![To do app](./readme-img/build-app-5.png)

5. Open [AWS CloudFormation](https://us-west-2.console.aws.amazon.com/cloudformation/) and review the resources that we created for your application.
![CloudFormation Stacks](./readme-img/build-app-6.png)

6. You can drill down to all the resources by selecting a stack.
![CloudFormation Resources](./readme-img/build-app-7.png)

Let's make a change from the "To-Do App" to the "AWS Events App".

## Step 3 – Update: Add GitHub Actions

You can use a GitHub Action alongside native CodeCatalyst actions in a CodeCatalyst workflow. You will be able to add any GitHub action from the [Marketplace](https://github.com/marketplace?type=actions). Let's add [Super-Linter GitHub Action](https://github.com/marketplace/actions/super-linter) to our application.

1. In the navigation pane, expand CI/CD and choose **Workflows**. Select your workflow and click **Edit** button at the top.
2. The linter can be added in YAML or Visual Mode.
  Visual mode:
  ![Visual mode step one](./readme-img/githubactions-01.png)
  ![Visual mode step two](./readme-img/githubactions-02.png)

3. Let's do the same but use *YAML*. Edit workflow and add the block:

```yaml
  SuperLinterAction:
    Identifier: aws/github-actions-runner@v1
    Inputs:
      Sources:
        - WorkflowSource 
    Configuration:
      Steps:
        - name: Lint Code Base
          uses: github/super-linter@v4.10.1
          env:
            VALIDATE_ALL_CODEBASE: "false"
            VALIDATE_MARKDOWN: "false"
            DEFAULT_BRANCH: main
```

![YAML mode](./readme-img/githubactions-03.png)

4. This time you will see that linter is green and our build has been successfully completed.

![Linter green](readme-img/githubactions-06.png)

## Step 4 - Deploy: Creating issues and launching Dev Environment

1. Optional step: Invite a team member. In the navigation pane, choose **Project settings**, then select **Members** Tab. Click **Invite** button. Enter email address in the popup and click **Invite**.
2. In the navigation pane, choose **Issues**. Click **Create issue**. Provide required information and click **Create issue**.
![Create issue](./readme-img/build-app-8.png)
3. Now let's address this issue. In the navigation pane, choose **Code**, then select **Dev Environments**. Click **Create Dev Environment**.
![Dev Environments](./readme-img/build-app-9.png)
4. Select **AWS Cloud9 (in browser)**. Complete all the fields as on the screenshot below and click **Create**.
![Cloud-9 Launch](./readme-img/build-app-10.png)
5. In your Cloud9 IDE, expand *frontend* folder and update *App.tsx* file and make 2 updates change 1) "To-Do List" to "AWS Events" and 2) "Add To-Do Item" to "Add a new event".
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

## Step 5 - Add  Compute for CI/CD workflows

CodeCatalyst offers the following compute types:

* Amazon EC2
* AWS Lambda
By default, workflow actions use the `Linux.x86-64.Large` on-demand fleet with an Amazon EC2 compute type.
Let's add provisioned fleet compute and assing it for our workflows.

1. In the navigation pane, expand CI/CD area and choose **Compute**. Click **Create provisioned fleet**.

![Go to compute](./readme-img/compute-01.png)
2. Define the name of the provisioned fleet, operating system, machine type, capacity and scaling mode. Click **Create**.

![Provisioned fleet](./readme-img/compute-02.png)
3. As soon as the fleet's status will be in `Active` mode, we can use it in our workflows.

![Fleet is active](./readme-img/compute-03.png)
4. In the navigation pane, expand CI/CD and choose **Workflows**. Select your workflow and click **Edit** button at the top. Compute can be defined [on top level](https://docs.aws.amazon.com/codecatalyst/latest/userguide/workflow.top.level.html#compute-reference), we will update the the workflow to use the provisioned compute for all actions.  
5. After *Triggers* section, let's add the block.

```yaml
Compute:
  Type: EC2
  Fleet: fleet01
```

![Compute section](./readme-img/compute-04.png)
6. Validate workflow and click **Commit**. The workflow will automatically run and use the trigger *PUSH*

7. Wait for the workflow to complete run using the new compute.
![Backend test](./readme-img/compute-05.png)

## Step 6 – Add Secret

If we decide to download third-party dependencies from private NPM, we will need to authorize it. Let's add a username as a secret.

1. In the navigation pane, expand CI/CD and choose **Secrets**, and create a new secret.
![Secrets](./readme-img/secrets-01.png)

2. Name is *npmUsername* value is `TestUser01`
![Create Secret](readme-img/secrets-02.png)

3. We can see our secret, and now the secret is ready to use on the workflow, to use the secret we should use the reference ID of the secret: `${Secrets.npmUsername}`

![Secret ID](readme-img/secrets-03.png)

4. To test our secret, we will add a variable to the **FrontendBuildAndPackage** action. You can add variables using Visual Configuration or YAML.

```yaml
  FrontendBuildAndPackage:
    Identifier: aws/build@v1
    DependsOn:
      - BackendCDKDeploy
    Inputs:
      Variables:                         # added
        - Name: NPMUSER                  # added
          Value: ${Secrets.npmUsername}  # added
      Sources:
        - WorkflowSource
    Outputs:
      Artifacts:
        - Name: frontend
          Files:
            - "**/*"
    Configuration:
      Steps:
        - Run: cd frontend               
        - Run: echo $NPMUSER             # added
        - Run: npm install
```

![Secret ID](readme-img/secrets-03-1.png)

5. Validate and Commit changes. Wait for the workflow to Complete a run until you see Status **Succeeded**.
6. Go back to the workflow, select **Visual** view, and click `FrontendBuildAndPackage`. On the right pane, you will see **Logs**, expand `echo $NPMUSSER`

![Output](readme-img/secrets-05.png)

7. The secret will be hidden.

![Secret is hidden](readme-img/secrets-04.png)

## Step 7 – Review Change Tracking

CodeCatalyst detects changes that require deployment for our application and initiates the deployment process. The process is executed using a "deploy action," which outlines the deployment details such as the target destination, the deployment method, and the implementation of a blue/green scheme, among other things. Currently, CodeCatalyst natively supports three deployment destinations: AWS CloudFormation stack, Amazon ECS, and AWS CDK. This provides several advantages, including versioning, traceability, rollbacks, monitoring, and integration with other CodeCatalyst features. Nevertheless, we have the flexibility to deploy our application using alternative deploy actions such as build, GitHub actions, AWS CodeDeploy, AWS CodeBuild, etc.

We will make a change in our application and validate change tracking:

1. In the navigation pane, expand CI/CD and choose **Change tracking**.

![Deployment tracking](readme-img/deployment01.png)

2. Some changes did not affect our application. They marked as *No deployment found*. For those changes, the deployment process was skipped.

3. Click **View details** on the recently updated and deployed workflow.  Please review the information about Tests and Code Cverage.

![DeploymentStatus](readme-img/deployment02.png)

4. Click on one of the tests and review the details.

![Test Status](readme-img/deployment03.png)

## Step 8 – Test: Review Reports

We were able to view the high-level test results. We can access each test report or code coverage report individually on the Reports Tab. CodeCatalyst supports the majority of test formats and code coverage. It allows using Software Composition Analysis (SCA) tools to analyze the application components and identify potential security vulnerabilities.

1. In the navigation pane, choose **Reports**.

![Test Result](readme-img/testresult01.png)

2. Click on the Name of a report to see details.

![Test Report](readme-img/testresult02.png)

3. You can see code coverage if you click on the file *clover.xml*.

![Code Coverage](readme-img/testresult03.png)

## Step 9 – Create and Deploy to a new environment

We will create a new environment and deploy our application to it. To do it first of all we need to create a new environment in CodeCatalyst.

1. In the navigation pane, expand CI/CD and choose **Environments**. And update the default environment, switch **Environment type** to *non-production* environment.
![Update Default Env](readme-img/environments01.png)

2. Create new environment, name of the environment is *ProductionEnv* and switch **Environment type** to *production* environment.
![Create prod env](readme-img/environments02.png)

3. Update workflow, add `BackendCDKBootstrapActionProd` and `BackendCDKDeployProd` steps for backend deployment to prod. Add `FrontendCDKBootstrapActionProd` and `FrontendCDKDeployProd` steps for frontend deployment to prod.

BackendCDKBootstrapActionProd

```yaml
  BackendCDKBootstrapActionProd:
    Identifier: aws/cdk-bootstrap@v1
    Inputs:
      Artifacts:
        - backend
    DependsOn:
      - BackendTest
      - BackendBuildAndPackage
    Configuration:
      Region: us-west-2
    Environment:
      Connections:
        - Role: CodeCatalystPreviewDevelopmentAdministrator-jh5pt4 # Update the role name
          Name: Prod
      Name: ProductionEnv
```

BackendCDKDeployProd

```yaml
  BackendCDKDeployProd:
    Identifier: aws/cdk-deploy@v1
    Inputs:
      Artifacts:
        - backend
    DependsOn:
      - BackendCDKBootstrapActionProd
    Configuration:
      StackName: TodoAppBackendStack-s8ass
      CdkRootPath: backend/
      Region: us-west-2
      Context: '{"stack_name": "TodoAppBackendStack-s8ass"}'
    Environment:
      Name: ProductionEnv
      Connections:
        - Name: Prod
          Role: CodeCatalystPreviewDevelopmentAdministrator-jh5pt4 # Update the role name
```

FrontendCDKBootstrapActionProd

```yaml
  FrontendCDKBootstrapActionProd:
    Identifier: aws/cdk-bootstrap@v1
    Inputs:
      Artifacts:
        - frontend
    DependsOn:
      - FrontendBuildAndPackage
      - FrontendTest
    Configuration:
      Region: us-west-2
    Environment:
      Connections:
        - Role: CodeCatalystPreviewDevelopmentAdministrator-jh5pt4
          Name: Prod
      Name: ProductionEnv
```

FrontendCDKDeployProd

```yaml
  FrontendCDKDeployProd:
    Identifier: aws/cdk-deploy@v1
    Inputs:
      Artifacts:
        - frontend
    DependsOn:
      - FrontendCDKBootstrapActionProd
    Configuration:
      StackName: TodoAppFrontendStack-qe7rl
      Region: us-west-2
      Context: '{"stack_name": "TodoAppFrontendStack-qe7rl", "api_domain":
        "${BackendCDKDeploy.ApiDomain}", "api_stage":
        "${BackendCDKDeploy.ApiStage}"}'
      CdkRootPath: frontend/cdk
    Environment:
      Connections:
        - Role: CodeCatalystPreviewDevelopmentAdministrator-jh5pt4
          Name: Prod
      Name: ProductionEnv
```

Make sure that you selected the right `StackName` and  `Role` for production environment. As soon as we commit our chages to the repository, CodeCatalyst will detect the changes and start the deployment process. After the deployment is completed, we can access our application in the production environment.

4. Let's status of new create `ProductionEnv` Environment. In the navigation pane, expand CI/CD and choose **Environments**. And click on the name of the environment.
![Production Env](readme-img/environments03.png)

5. Let's find URL for the production env. In the navigation pane, expand CI/CD and choose **Workflows**, and the last run, switch to the **Variables** tab, in search field type `FrontendCDKDeployProd`.
![Production Env](readme-img/environments04.png)
## Step  10 – Monitor: Application and Infrastructure monitoring

We are at the final stage of CI/CD operations - Monitoring. We can do two types of monitoring:

* Monitoring of CI/CD operations. We can monitor API calls for CodeCatalysts actions. These API operations are managed by AWS CloudTrail. You can read more in [CodeCatalyst Documentation](https://docs.aws.amazon.com/codecatalyst/latest/userguide/ipa-monitoring.html)
* Application performance monitoring focused on monitoring and analyzing applications and the infrastructure that hosts them. Amazon CloudWatch Metrics and Amazon CloudWatch Logs are used for observability by default.

Let's configure an application monitoring dashboard:

1. Examine API activities in the dashboard. Sign in to the API Gateway console at <https://console.aws.amazon.com/apigateway>.

2. Choose the name of the API. Under the selected API, choose Dashboard.

3. To display a summary of API activity over time, for Stage, choose the desired stage. Use From and To to enter the date range.

![API Gateway](readme-img/monitor-01.png)

4. Click on API Calls, and the metric will open in Amazon CloudWatch.

5. Click **Actions** and choose *Add to dashboard*.
![API Gateway](readme-img/monitor-02.png)

6. Click on **Browse** Tab and add additional metrics that you would like to monitor.
![CloudWatch](readme-img/monitor-03.png)

7. Try different visualization types and save your graph.
![CloudWatch](readme-img/monitor-04.png)

## Step 11 - Cleaning up resources

1. Clean CodeCatalyst project by going to **Project settings** and click **Delete project**. In the popup window type "delete" and click **Delete Project**.
![CodeCatalyst Delete](./readme-img/clean-up-1.png)

2. Clean up deployed infrastructure:

    2.1 Sign in to the AWS Management Console with the same account that you added to your space, and then choose AWS CloudFormation. You will see "TodoAppFrontendStack" and "TodoAppBackendStack". Select first the first one, and click "Delete". Repete with the second stack.
![CLoudformation Delete](./readme-img/clean-up-2.png)

    2.2 Validate that stacks have been successfully deleted.
![Stacks Deleted](./readme-img/clean-up-3.png)

### Adding a resource to your application

This project leverages AWS CDK and therfore can be easily extended by updating AWS CDK code.

## Additional resources

See the Amazon [CodeCatalyst User Guide](https://docs.aws.amazon.com/codecatalyst/latest/userguide/welcome.html) for additional information on using the features and resources of Amazon CodeCatalyst.
