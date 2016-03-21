# Serverless Authentication

**Work in progress.** This project is aimed to be generic authentication boilerplate / component for serverless (http://www.serverless.com).

Test page that uses this boilerplate in backend: http://laardee.github.io/serverless-authentication-gh-pages

Provider packages:

* facebook https://www.npmjs.com/package/serverless-authentication-facebook
* google https://www.npmjs.com/package/serverless-authentication-google
* windows live https://www.npmjs.com/package/serverless-authentication-microsoft
* more to come

## Installation

1. First install Serverless framework `npm install -g serverless`. Version 0.4.2 works ok.
2. Then create a new project based on this boilerplate `sls project install -n="myProject" serverless-authentication-boilerplate`
3. Change directory to one that was created in previous step `cd myProject` and set environmental variables for config

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

## The structure of authentication component

* signin
  * endpoint: authentication/signin/{provider}
  * handler: signin function creates redirect url to oauth provider
* callback
  * endpoint: authentication/callback/{provider}
  * handler: function is called by oauth provider with `code` parameter
* authorize
  * endpoint: no end point
  * handler: is used by Api Gateway custom authorizer
* test-token
  * endpoint: authentication/test-token
  * handler: test-token function can be used to test custom authorizer, it returns principalId of custom authorizer policy. It is mapped as username in request template.

## Custom Authorizer (TBD)

To use Custom Authorized with Api Gateway, is has to be defined manually in AWS console, current version (0.4.2) of Serverless frameworks doesn't support it, but as it comes available it is added to this boilerplate.

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
