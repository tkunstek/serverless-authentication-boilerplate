# Serverless Authentication

This project is aimed to be generic authentication boilerplate for Serverless framework (http://www.serverless.com).

Webapp demo that uses this boilerplate: http://laardee.github.io/serverless-authentication-gh-pages

## Boilerplate is now compatible with Serverless v.0.5.

**Few small issues with Serverless v.0.5.**

For now you need to do some manual adjustment with Custom Authorizer and CORS in AWS Console. Project install with name parameter doesn't seem to work either, so boilerplate is installed with default name 'serverless-authentication-boilerplate'.

## Installation

1. Install Serverless framework with `npm install -g serverless`.
2. Create a new project based on this boilerplate `serverless project install -n myProject serverless-authentication-boilerplate` (-n or --name doesn't seem to work in Serverless v.0.5)
3. Change directory to one that was created in previous step.
4. Run `npm install`.
5. Set [environmental variables](#env-vars).
6. Run `serverless function deploy` on project root folder. Select all and `Deploy`. Or you can enable serverless-cors-plugin and first deploy functions `serverless function deploy` and then deploy endpoints with parameter --all `serverless endpoint deploy --all`.
7. Fine-tune [Custom Authorizer](#custom-authorizer) (and [CORS](#cors) if you choose not to use CORS plugin) in AWS Console.

You need to deploy the API by hand after the changes.

The redirect URI that needs to be defined in oauth provider's application settings is the callback endpoint of the API. For example if you use facebook login, the redirect URI is _https://API-ID.execute-api.us-east-1.amazonaws.com/dev/authentication/callback/facebook_ and for google _https://API-ID.execute-api.us-east-1.amazonaws.com/dev/authentication/callback/google_.

## <a id="env-vars"></a>Environmental variables

Open _meta/variables/s-variables-STAGE.json where STAGE is the stage you are using e.g. s-variables-dev.json in "dev" stage.

Add following variables to file:

```
"redirectClientURI": "http://url-to-frontend-webapp/",
"tokenSecret": "secret-for-json-web-token",
"providerFacebookId": "facebook-app-id",
"providerFacebookSecret": "facebook-app-secret",
"providerGoogleId": "google-app-id",
"providerGoogleSecret": "google-app-secret",
"providerMicrosoftId": "microsoft-app-id",
"providerMicrosoftSecret": "microsoft-app-secret"
```

Environmental variables are now mapped in s-function.json files, for example in authentication/signin/s-function.json.

## <a id="custom-authorizer"></a>Custom Authorizer

Custom Authorizer is deployed but it is lacking some of the settings, these settings should be added.

1. Select deployed API
2. Select _Custom Authorizers_ from top menu that has _Resourses_ selected by default. Then select _authorize_ function from list
3. Edit the in the form
  * Name: _authorizer_, you can also rename it.
  * Lambda region: Select the region where your _authorize_ function is deployed
  * Lambda function: This is the _authorize_ function in authentication folder
  * Identity token source: _method.request.header.Authorization_
  * Token validation expression: _.*_
  * Result TTL in seconds: 0

Click _Update_.

## <a id="cors"></a>Cross-origin resource sharing (CORS)

CORS plugin (https://github.com/joostfarla/serverless-cors-plugin) is now compatible with Serverless 0.5, but `serverless project install` failed to install plugins, so you need to manually enable cors to test-token resource in AWS Console.

Instructions in AWS docs http://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-cors.html

## The structure

* authentication/signin
  * endpoint: /authentication/signin/{provider}, redirects to oauth provider login page
  * handler: signin function creates redirect url to oauth provider
* authentication/callback
  * endpoint: /authentication/callback/{provider}, redirects back to client webapp with token url parameter
  * handler: function is called by oauth provider with `code` parameter
* authentication/authorize
  * endpoint: no end point
  * handler: is used by Api Gateway custom authorizer
* test-tokent/test-token
  * endpoint: /test-token
  * handler: test-token function can be used to test custom authorizer, it returns principalId of custom authorizer policy. It is mapped as username in request template.

## Provider packages

* facebook https://www.npmjs.com/package/serverless-authentication-facebook
* google https://www.npmjs.com/package/serverless-authentication-google
* windows live https://www.npmjs.com/package/serverless-authentication-microsoft
* more to come