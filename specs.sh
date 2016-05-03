#!/usr/bin/env bash
SERVERLESS_PROJECT="serverless-authentication-boilerplate"
SERVERLESS_STAGE="dev"
SERVERLESS_REGION="eu-central-1"
LOCAL_DDB_ENDPOINT="http://192.168.99.100:8000"

docker-machine start default
eval "$(docker-machine env default)"
docker-compose up -d
SERVERLESS_STAGE=$SERVERLESS_STAGE SERVERLESS_REGION=$SERVERLESS_REGION SERVERLESS_PROJECT=$SERVERLESS_PROJECT LOCAL_DDB_ENDPOINT=$LOCAL_DDB_ENDPOINT ./node_modules/.bin/mocha specs/
docker-compose down
docker-machine stop default
