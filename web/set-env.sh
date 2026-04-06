#!/bin/bash

SCRIPT_DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
cd $SCRIPT_DIR

if [[ -z "$1" ]]; then
    echo "Usage: $0 <env>"
    echo "(Env may be \"dev\" or \"prod\".)"
    exit 1
else
    ENV=$1
fi

echo "export NEXT_PUBLIC_APP_ENV=${ENV}" > ./.env
echo "export APP_ENV=${ENV}" >> ./.env
echo >> ./.env
