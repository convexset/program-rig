#!/usr/bin/env python3
import os
import json
import boto3

import aws_cdk as cdk

import deployment_env
from infra_stack import InfraStack

env = deployment_env.get_env()
env_config = deployment_env.load_config()
app_name = env_config.get('App Name')
app_name_prefix = env_config.get("App Name Prefix")

app = cdk.App()
InfraStack(
    app,
    f'{app_name_prefix}-Stack-{env}',
    env=cdk.Environment(
        account=os.getenv('CDK_DEFAULT_ACCOUNT'),
        region=os.getenv('CDK_DEFAULT_REGION'),
    ),
    # For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html
)

app.synth()
