# serverless-authentication-boilerplate

This project is aimed to be generic authentication library for serverless (http://www.serverless.com) and is still very much work-in-progress state.

Test page: http://laardee.github.io/serverless-authentication-gh-pages

Provider repositories:

* facebook https://github.com/laardee/serverless-authentication-facebook
* google https://github.com/laardee/serverless-authentication-google
* windows live https://github.com/laardee/serverless-authentication-microsoft

## Installation (TBD)

1. First install Serverless framework `npm install -g serverless`, if not yet installed. Version 0.4.2 works ok.
2. Then create a new project based on this boilerplate `sls project install -n="myProject" serverless-authentication-boilerplate`
(If needed go to created directory `cd myProject` and install dependencies with `npm install`)
3. Set environmental variables for config

Facebook app id and secret
```
sls env set -k PROVIDER_FACEBOOK_ID -v NNNNN
sls env set -k PROVIDER_FACEBOOK_SECRET -v NNNNN
```

Google app id and secret

```
sls env set -k PROVIDER_GOOGLE_ID -v NNNNN
sls env set -k PROVIDER_GOOGLE_SECRET -v NNNNN
```

Microsoft app id and secret
```
sls env set -k PROVIDER_MICROSOFT_ID -v NNNNN
sls env set -k PROVIDER_MICROSOFT_SECRET -v NNNNN
```

REDIRECT_CLIENT_URI is the return uri to frontend application

REDIRECT_URI is the callback uri for providers, this one need to be set as callback/redirect uri in provider application settings `{provider}` is replaced automatically with correct provider. For example in Facebook application settings in developer.facebook.com you need to set `https://*API-ID*.execute-api.eu-west-1.amazonaws.com/dev/callback/facebook` as redirect uri.

TOKEN_SECRET is for json web token

```
sls env set -k REDIRECT_CLIENT_URI -v http://laardee.github.io/serverless-authentication-gh-pages/
sls env set -k REDIRECT_URI -v https://*API-ID*.execute-api.eu-west-1.amazonaws.com/dev/callback/{provider}
sls env set -k TOKEN_SECRET -v token-secret
```

4.

## How this works

This boilerplate contains authentication module that has four lambda functions
1. signin function creates redirect url to oauth provider
2. callback function is called by oauth provider with `code` parameter
3. authorize function is used by Api Gateway custom authorizer
4. test-token function can be used to test custom authorizer, it returns principalId of custom authorizer policy. It is mapped as username in request template.

To use Custom Authorized with Api Gateway, is has to be defined manually in AWS console, current version (0.4.2) of Serverless frameworks doesn't support it.


-------------------


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