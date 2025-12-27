#!/bin/bash

SCRIPT_DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
cd $SCRIPT_DIR

export AWS_PROFILE="convexset"

source ../pr-venv/bin/activate

if [[ $1 != 'dev' && $1 != 'prod' ]]
then
    echo "Usage: $0 <stage>"
    echo "(Stage may be \"dev\" or \"prod\".)"
else
    export API_ENV=$1

    export AWS_ACCOUNT=$(aws sts get-caller-identity --query 'Account' | cut -d '"' -f 2)
    export AWS_REGION="ap-southeast-1"

    chalice deploy --stage $API_ENV
fi