






-----

serverless 0.5 stuff


```
"authorizationType": "CUSTOM",
"authorizerId": "nnnnnnn",
```
in authentication/test-token/s-function.json requires https://github.com/serverless/serverless/issues/626 Custom Authorizer support

authorizationType can be set to none when deploying endpoint and defined in aws console
```
"authorizationType": "none"
```
