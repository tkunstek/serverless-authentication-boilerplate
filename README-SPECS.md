Running Tests

* Install Docker
* Run docker-compose up to install and run DynamoDB.
* Add the localDynamoDbEndpoint variable with the value http://<DOCKER-MACHINE-IP>:8000 to _meta/variables/s-variables-common.json. Example value: http://192.168.99.100:8000.
* Run sls setup db -s <stage> -r <region> to create tables in the local DynamoDB instance.
* Check that package.json script/test has the same stage and region defined as the DynamoDb table created in the last step.
* Run npm test.