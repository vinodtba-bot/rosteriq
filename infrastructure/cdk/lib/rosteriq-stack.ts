import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import { Construct } from 'constructs';
import * as path from 'path';

const MONOREPO_ROOT = path.join(__dirname, '../../../../');

export class RosterIQStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const eventBus = new events.EventBus(this, 'RosterIQEventBus', {
      eventBusName: 'rosteriq-bus',
    });

    const ingestionQueue = new sqs.Queue(this, 'IngestionQueue', {
      queueName: 'rosteriq-ingestion.fifo',
      fifo: true,
      contentBasedDeduplication: true,
    });

    const bucket = new s3.Bucket(this, 'RosterIQBucket', {
      bucketName: undefined, // let CDK generate
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      eventBridgeEnabled: true,
    });

    // Lambda: Ingestion (TypeScript, S3 trigger)
    const ingestionLambda = new nodejs.NodejsFunction(this, 'IngestionLambda', {
      functionName: 'rosteriq-ingestion',
      entry: path.join(MONOREPO_ROOT, 'services/ingestion/src/handler.ts'),
      handler: 'onS3ObjectCreated',
      runtime: lambda.Runtime.NODEJS_20_X,
      projectRoot: MONOREPO_ROOT,
      environment: {
        EVENT_BUS_NAME: eventBus.eventBusName,
      },
      timeout: cdk.Duration.seconds(30),
    });
    eventBus.grantPutEventsTo(ingestionLambda);
    bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(ingestionLambda)
    );

    // Lambda: Validation (TypeScript, EventBridge)
    const validationLambda = new nodejs.NodejsFunction(this, 'ValidationLambda', {
      functionName: 'rosteriq-validation',
      entry: path.join(MONOREPO_ROOT, 'services/validation/src/handler.ts'),
      handler: 'validate',
      runtime: lambda.Runtime.NODEJS_20_X,
      projectRoot: MONOREPO_ROOT,
      environment: {
        EVENT_BUS_NAME: eventBus.eventBusName,
      },
      timeout: cdk.Duration.seconds(30),
    });
    eventBus.grantPutEventsTo(validationLambda);
    new events.Rule(this, 'ValidationRule', {
      eventBus,
      eventPattern: {
        source: ['rosteriq.ingestion'],
        detailType: ['RosterIQ.Ingestion.ObjectCreated'],
      },
      targets: [new targets.LambdaFunction(validationLambda)],
    });

    // Lambda: Compliance (TypeScript, EventBridge)
    const complianceLambda = new nodejs.NodejsFunction(this, 'ComplianceLambda', {
      functionName: 'rosteriq-compliance',
      entry: path.join(MONOREPO_ROOT, 'services/compliance/src/handler.ts'),
      handler: 'runComplianceCheck',
      runtime: lambda.Runtime.NODEJS_20_X,
      projectRoot: MONOREPO_ROOT,
      environment: {
        EVENT_BUS_NAME: eventBus.eventBusName,
      },
      timeout: cdk.Duration.seconds(30),
    });
    eventBus.grantPutEventsTo(complianceLambda);

    // Lambda: FHIR API (TypeScript, API Gateway)
    const fhirApiLambda = new nodejs.NodejsFunction(this, 'FhirApiLambda', {
      functionName: 'rosteriq-fhir-api',
      entry: path.join(MONOREPO_ROOT, 'services/fhir-api/src/handler.ts'),
      handler: 'handleFhirRequest',
      runtime: lambda.Runtime.NODEJS_20_X,
      projectRoot: MONOREPO_ROOT,
      timeout: cdk.Duration.seconds(29),
    });
    const fhirApi = new apigateway.RestApi(this, 'FhirApi', {
      restApiName: 'RosterIQ FHIR API',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },
    });
    const fhirProxy = fhirApi.root.addResource('{proxy+}');
    fhirProxy.addMethod(
      'ANY',
      new apigateway.LambdaIntegration(fhirApiLambda)
    );

    // Lambda: Analytics (TypeScript)
    const analyticsLambda = new nodejs.NodejsFunction(this, 'AnalyticsLambda', {
      functionName: 'rosteriq-analytics',
      entry: path.join(MONOREPO_ROOT, 'services/analytics/src/handler.ts'),
      handler: 'runQuery',
      runtime: lambda.Runtime.NODEJS_20_X,
      projectRoot: MONOREPO_ROOT,
      timeout: cdk.Duration.minutes(1),
    });
    analyticsLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['athena:StartQueryExecution', 'athena:GetQueryExecution', 'athena:GetQueryResults'],
        resources: ['*'],
      })
    );

    // Lambda: Agents (Python)
    const agentsLambda = new lambda.Function(this, 'AgentsLambda', {
      functionName: 'rosteriq-agents',
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: 'handler.handler',
      code: lambda.Code.fromAsset(
        path.join(__dirname, '../../../../services/agents'),
        { exclude: ['__pycache__', '*.pyc'] }
      ),
      timeout: cdk.Duration.seconds(60),
    });

    // Lambda: Graph (Python)
    const graphLambda = new lambda.Function(this, 'GraphLambda', {
      functionName: 'rosteriq-graph',
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: 'handler.handler',
      code: lambda.Code.fromAsset(
        path.join(__dirname, '../../../../services/graph'),
        { exclude: ['__pycache__', '*.pyc'] }
      ),
      timeout: cdk.Duration.seconds(30),
    });

    // Outputs
    new cdk.CfnOutput(this, 'EventBusName', {
      value: eventBus.eventBusName,
      description: 'RosterIQ EventBridge bus name',
    });
    new cdk.CfnOutput(this, 'BucketName', {
      value: bucket.bucketName,
      description: 'RosterIQ ingestion S3 bucket',
    });
    new cdk.CfnOutput(this, 'FhirApiUrl', {
      value: fhirApi.url,
      description: 'FHIR API base URL',
    });
  }
}
