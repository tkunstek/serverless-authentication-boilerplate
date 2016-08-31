# Serverless Authentication
[![serverless](http://public.serverless.com/badges/v3.svg)](http://www.serverless.com)

This project is aimed to be a generic authentication boilerplate for the [Serverless framework](http://www.serverless.com).

This boilerplate is compatible with the Serverless v.0.5.3+. To install Serverless framework run `npm install -g serverless@0.5.5`.

**I'm currently upgrading the boilerplate to work with Serverless v.1.0 beta**

Webapp demo that uses this boilerplate: http://laardee.github.io/serverless-authentication-gh-pages

## Use cases

1. You can use this as a base for your project and create resource functions and endpoints to this project.

2. If you wish to add authentication functions to an existing project, you can download [dist/authentication.zip](https://github.com/laardee/serverless-authentication-boilerplate/blob/master/dist/authentication.zip) and [dist/authorization.zip](https://github.com/laardee/serverless-authentication-boilerplate/blob/master/dist/authorization.zip) which contains authentication and authorization files. Then extract files to your project and run `npm install` in both directories. Remember to create DynamoDB table for cache.

3. Decouple authentication and resources. Use this project as an authentication provider and create resources to another Serverless project. To authorize request in resource api, you need to copy [dist/authorization.zip](https://github.com/laardee/serverless-authentication-boilerplate/blob/master/dist/authorization.zip) files to the project and define tokenSecret environmental variable that matches the authentication project's tokenSecret, which is used to verify JSON Web Token.

## Installation

Installation will create one DynamoDB table for OAuth state and refresh tokens.

1. Create a new project based on this boilerplate `serverless project install -n myAuthenticationProject serverless-authentication-boilerplate`. Don't mind the `WARNING: This variable is not defined: NNN` warnings, those will be set in next step.
2. Change directory to the one that was created in previous step and set [environmental variables](#env-vars).
3. Run `serverless dash deploy` on the project root folder. Select all and `Deploy`.

**Few small issues with the Serverless v.0.5. and AWS Lambda**

If you are upgrading project runtime, you need to remove the old lambda function from the AWS first before you can deploy functions with node 4.3 runtime. You may also need to do some manual adjustment with Custom Authorizer AWS Console.

## Set up Authentication Provider Application Settings

The redirect URI that needs to be defined in oauth provider's application settings is the callback endpoint of the API. For example if you use facebook login, the redirect URI is **https://API-ID.execute-api.us-east-1.amazonaws.com/dev/authentication/callback/facebook** and for google **https://API-ID.execute-api.us-east-1.amazonaws.com/dev/authentication/callback/google**.

## <a id="env-vars"></a>Environmental Variables

Open _meta/variables/s-variables-STAGE.json where STAGE is the stage you are using e.g. s-variables-dev.json in "dev" stage.

If you are using stage "dev", then contents of the s-variables-dev.json should be
```
{
  "stage": "dev",
  "redirectClientURI": "http://url-to-frontend-webapp/",
  "tokenSecret": "secret-for-json-web-token",
  "providerFacebookId": "facebook-app-id",
  "providerFacebookSecret": "facebook-app-secret",
  "providerGoogleId": "google-app-id",
  "providerGoogleSecret": "google-app-secret",
  "providerMicrosoftId": "microsoft-app-id",
  "providerMicrosoftSecret": "microsoft-app-secret",
  "providerCustomGoogleId": "google-app-id",
  "providerCustomGoogleSecret": "google-app-secret"
}
```

Environmental variables are mapped in s-function.json files, for example in the authentication/signin/s-function.json. If you add more providers, those should be added to the s-function.json files also and if you don't use all the providers provided in this example, remove variables from _meta/variables/s-variables-STAGE.json and s-function.json files.

## The Structure

Authentication
* authentication/signin
  * endpoint: /authentication/signin/{provider}, redirects to oauth provider login page
  * handler: signin function creates redirect url to oauth provider and saves `state` to DynamoDB
* authentication/callback
  * endpoint: /authentication/callback/{provider}, redirects back to client webapp with token url parameter
  * handler: function is called by oauth provider with `code` and `state` parameters and it creates authorization and refresh tokens
* authentication/refresh
  * endpoint: /authentication/refresh/{refresh_token}, returns new authentication token and refresh token
  * handler: function revokes refresh token

Authorization
* authorization/authorize
  * endpoint: no end point
  * handler: is used by Api Gateway custom authorizer

Testing
* test-token/test-token
  * endpoint: /test-token
  * handler: test-token function can be used to test custom authorizer, it returns principalId of custom authorizer policy. It is mapped as username in request template.

## Provider Packages

* facebook [serverless-authentication-facebook](https://www.npmjs.com/package/serverless-authentication-facebook)
* google [serverless-authentication-google](https://www.npmjs.com/package/serverless-authentication-google)
* windows live [serverless-authentication-microsoft](https://www.npmjs.com/package/serverless-authentication-microsoft)
* more to come

If the authentication provider that you need is not listed, you can make a [custom provider](#custom-provider) or create a provider package for others to use. Here is an example repository that can be used as a starting point https://github.com/laardee/serverless-authentication-provider. When you implement a new fancy provider, create an issue or a pull request and it will be added to the Provider Packages listing.

## <a id="custom-provider"></a>Custom Provider

Package contains example [/authentication/lib/custom-google.js](https://github.com/laardee/serverless-authentication-boilerplate/blob/master/authentication/lib/custom-google.js) how to implement custom authentication provider using generic Provider class. To test custom provider go to http://laardee.github.io/serverless-authentication-gh-pages and click 'custom-google' button.

## Running Tests on Mac

* Install Docker
* Run ./specs-docker.sh