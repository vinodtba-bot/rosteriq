#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { RosterIQStack } from '../lib/rosteriq-stack';

const app = new cdk.App();

new RosterIQStack(app, 'RosterIQStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION ?? 'us-east-1',
  },
  description: 'RosterIQ™ serverless infrastructure',
});
