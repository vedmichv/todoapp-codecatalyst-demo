import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3_deployment from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';

export class FrontendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const frontendSourceBucket = new s3.Bucket(this, "FrontendAppBucket", {
      websiteIndexDocument: "index.html",
    })

    const frontendOriginAccessIdentity = new cloudfront.OriginAccessIdentity(this, "FrontendAppOIA", {
      comment: "Access from CloudFront to the bucket."
    })

    frontendSourceBucket.grantRead(frontendOriginAccessIdentity)

    const frontendCloudfront = new cloudfront.CloudFrontWebDistribution(this, "FrontendAppCloudFront", {
      originConfigs: [{
        s3OriginSource: {
          s3BucketSource: frontendSourceBucket,
          originAccessIdentity: frontendOriginAccessIdentity
        },
        behaviors: [{isDefaultBehavior: true}]
      },{
        customOriginSource: {
          domainName: `${this.node.tryGetContext('api_domain')}`,
          originPath: `/${this.node.tryGetContext('api_stage')}`,
          httpPort: 80,
          httpsPort: 443,
          originProtocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
          allowedOriginSSLVersions: [cloudfront.OriginSslPolicy.TLS_V1_2]
        },
        behaviors: [{
          pathPattern: "/api/*",
          allowedMethods: cloudfront.CloudFrontAllowedMethods.ALL,
          cachedMethods: cloudfront.CloudFrontAllowedCachedMethods.GET_HEAD_OPTIONS,
          defaultTtl: cdk.Duration.seconds(0),
          minTtl: cdk.Duration.seconds(0),
          maxTtl: cdk.Duration.seconds(0),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          forwardedValues: {
            queryString: true,
            cookies: {
                forward: "all"
            },
            headers: ["Authorization"]
          }
        }]
      }],
      errorConfigurations: [{
        errorCode: 404,
        errorCachingMinTtl: 0,
        responseCode: 200,
        responsePagePath: "/index.html"
      }]
    })

    new s3_deployment.BucketDeployment(this, "FrontendAppDeploy", {
      sources: [s3_deployment.Source.asset("frontend/build")],
      destinationBucket: frontendSourceBucket,
      distribution: frontendCloudfront,
      distributionPaths: ["/*"]
    })

    new cdk.CfnOutput(this, "AppURL", {value: `https://${frontendCloudfront.distributionDomainName}/`})
  }
}
