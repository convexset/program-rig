#!/bin/bash

SCRIPT_DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
cd $SCRIPT_DIR

source ./set-aws-profile.sh

if [[ $1 != 'dev' && $1 != 'prod' ]]
then
    echo "Usage: $0 <stage>"
    echo "(Stage may be \"dev\" or \"prod\".)"
else
    export CDK_ENV=$1
    export CDK_DEFAULT_ACCOUNT=$(aws sts get-caller-identity --query 'Account' | cut -d '"' -f 2)
    export CDK_DEFAULT_REGION="ap-southeast-1"

    cdk diff
fi