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
```
sls env set -k REDIRECT_CLIENT_URI -v http://laardee.github.io/serverless-authentication-gh-pages/
```

REDIRECT_URI is the callback uri for providers, this one need to be set as callback/redirect uri in provider application settings `{provider}` is replaced automatically with correct provider. For example in Facebook application settings in developer.facebook.com you need to set `https://*API-ID*.execute-api.eu-west-1.amazonaws.com/dev/callback/facebook` as redirect uri.
```
sls env set -k REDIRECT_URI -v https://*API-ID*.execute-api.eu-west-1.amazonaws.com/dev/callback/{provider}
```

TOKEN_SECRET is for json web token
```
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

## Custom Authorizer creation in AWS console

To use Custom Authorized with Api Gateway, is has to be defined manually in AWS console, current version (0.4.2) of Serverless frameworks doesn't support it, but as it comes available it is added to this boilerplate.

How to create custom authorizer in AWS console. You need to have deployed this boilderplate before you create the authorizer.

1. Select deployed API
2. Select _Custom Authorizers_from top menu that has _Resourses_ selected by default. Then select _Create_
3. Fill in the form
  * Name: CustomAuthorizer or what ever you wish to call your authorizer.
  * Lambda region: Select the region where your Authorization function is deployed
  * Lambda function: This is the _authorize_ function in authentication component
  * Execution role: this is optional and can be left empty
  * Identity token source: _method.request.header.Authorization_
  * Token validation expression: _.*_
  * Result TTL in seconds: 0
4. Select _Create_. With these settings you'll get started but for production you may want to change least TTL.
5. Go back to _Resourses_ from the same menu where the _Custom Authorizers_ was selected in step 2.
6. Select _/test-token/GET_ method and then select _Method Request_.
7. Click the pencil icon next to _Authorization [NONE]_ dropdown menu and select _Custom Authorizer_ / _Custom Authorizer_ (or whatever name you gave your authorizer in step 3)
8. Click the tick icon next to dropdown menu to save your selection.
