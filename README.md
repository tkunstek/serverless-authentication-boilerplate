# serverless-authentication-boilerplate

This project is aimed to be generic authentication library for serverless (http://www.serverless.com) and is still very much work-in-progress state.

Test page: http://laardee.github.io/serverless-authentication-gh-pages

Provider repositories:

* facebook https://github.com/laardee/serverless-authentication-facebook
* google https://github.com/laardee/serverless-authentication-google
* windows live https://github.com/laardee/serverless-authentication-microsoft

## Installation (TBD)

1. First install Serverless framework `npm install -g serverless`, if not yet installed. Version 4.2. works ok.
2. Then create a new project based on this boilerplate `sls project install -n="myProject" serverless-authentication-boilerplate`
3. Go to created directory `cd myProject` and install dependencies with `npm install`

## How this works

This boilerplate contains authentication module that has four lambda functions
1. signin function creates redirect url to oauth provider
2. callback function is called by oauth provider with `code` parameter
3. authorize function is used by Api Gateway custom authorizer
4. test-token function can be used to test custom authorizer, it returns principalId of custom authorizer policy. It is mapped as username in request template.

To use Custom Authorized with Api Gateway, is has to be defined manually in AWS console, version 4.2. of Serverless frameworks doesn't support it.

set environmental variables for config

```
sls env set -k PROVIDER_FACEBOOK_ID -v NNNNN
sls env set -k PROVIDER_FACEBOOK_SECRET -v NNNNN
sls env set -k PROVIDER_GOOGLE_ID -v NNNNN
sls env set -k PROVIDER_GOOGLE_SECRET -v NNNNN
sls env set -k PROVIDER_MICROSOFT_ID -v NNNNN
sls env set -k PROVIDER_MICROSOFT_SECRET -v NNNNN
sls env set -k REDIRECT_CLIENT_URI -v http://laardee.github.io/serverless-authentication-gh-pages/
sls env set -k REDIRECT_URI -v https://*API-ID*.execute-api.eu-west-1.amazonaws.com/dev/callback/{provider}
sls env set -k TOKEN_SECRET -v token-secret
```

Notice
```
"authorizationType": "CUSTOM",
"authorizerId": "nnnnnnn",
```
in authentication/test-token/s-function.json requires https://github.com/serverless/serverless/issues/626 Custom Authorizer support

authorizationType can be set to none when deploying endpoint and defined in aws console
```
"authorizationType": "none"
```