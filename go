#!/bin/bash

cd ~/repositories/program-rig

export PROJECT_ROOT=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

echo
echo "export AWS_PROFILE=convexset"
export AWS_PROFILE=convexset
echo
echo "Use go-api or go-web to switch to the appropriate folder."
echo


function go-api {
    echo
    echo "Switching to $PROJECT_ROOT/api"
    cd $PROJECT_ROOT/api
    nvm use stable
    echo
    echo "PR APPLICATION"
    echo "==============="
    echo "To run Jupyter Lab:        cd $PROJECT_ROOT && jupyter lab"
    echo "To run App Shell:          ./app-shell.sh"
    echo "To deploy:                 ./deploy.sh [env-name]"
    echo "To deploy dev & run tests: ./deploy.sh dev --run-tests"
    echo "To deploy all:             ./deploy.sh dev && ./deploy.sh prod"
    echo
    echo
}


function go-web {
    echo
    echo "Switching to $PROJECT_ROOT/web"
    cd $PROJECT_ROOT/web
    echo
    echo "To run dev locally:        npm run dev"
    echo "To deploy:                 deploy-web [env-name]"
    echo "To deploy all:             deploy-web prod; deploy-web dev"
    echo
}

deploy-web() {
    local ENV=${1:-dev}
    echo
    echo "Switching to $PROJECT_ROOT/web"
    cd $PROJECT_ROOT/web
    echo
    echo "Building web for $ENV"
    npm run build:$ENV
    echo
    echo "Syncing web content to S3 for $ENV"
    npm run sync-build:$ENV
    echo
}

[[ ! -z $VIRTUAL_ENV ]] && deactivate
source $PROJECT_ROOT/pr-venv/bin/activate
go-web
