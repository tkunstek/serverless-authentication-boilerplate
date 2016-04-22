# Serverless Authentication
[![serverless](http://public.serverless.com/badges/v3.svg)](http://www.serverless.com)

This project is aimed to be a generic authentication boilerplate for the [Serverless framework](http://www.serverless.com).

This boilerplate is compatible with the Serverless v.0.5.3+

Webapp demo that uses this boilerplate: http://laardee.github.io/serverless-authentication-gh-pages

## Use cases

1. You can use this as a base for your project and create resource functions and endpoints to this project.

2. If you wish to add authentication functions to an existing project, you can download [dist/authentication.zip](https://github.com/laardee/serverless-authentication-boilerplate/blob/master/dist/authentication.zip) and [dist/authorization.zip](https://github.com/laardee/serverless-authentication-boilerplate/blob/master/dist/authorization.zip) which contains authentication and authorization files. Then extract files to your project and run `npm install` in both directories.

3. Decouple authentication and resources. Use this project as an authentication provider and create resources to another Serverless project. To authorize request in resource api, you need to copy [dist/authorization.zip](https://github.com/laardee/serverless-authentication-boilerplate/blob/master/dist/authorization.zip) files to the project and define tokenSecret environmental variable that matches the authentication project's tokenSecret, which is used to verify JSON Web Token.

**Few small issues with the Serverless v.0.5. and AWS Lambda**

For now, you need to do some manual adjustment with Custom Authorizer AWS Console. If you are upgrading project runtime, you need to remove the old lambda function from the AWS first before you can deploy functions with node 4.3 runtime.

## Installation

1. Install Serverless framework with `npm install -g serverless`.
2. Create a new project based on this boilerplate `serverless project install -n myAuthenticationProject serverless-authentication-boilerplate`
3. Change directory to the one that was created in previous step.
4. Run `npm install`.
5. Set [environmental variables](#env-vars).
6. Run `serverless dash deploy` on the project root folder. Select all and `Deploy`. Then deploy endpoints with parameter --all `serverless endpoint deploy --all`.
7. Fine-tune [Custom Authorizer](#custom-authorizer) in AWS Console.

In step 6, you may also want to enable 'serverless-plugin-autoprune', it is a nice plugin that removes old lambda function versions from AWS.

You need to deploy the API by hand in AWS console after the changes.

## Set up Authentication Provider Application Settings

The redirect URI that needs to be defined in oauth provider's application settings is the callback endpoint of the API. For example if you use facebook login, the redirect URI is **https://API-ID.execute-api.us-east-1.amazonaws.com/dev/authentication/callback/facebook** and for google **https://API-ID.execute-api.us-east-1.amazonaws.com/dev/authentication/callback/google**.

## <a id="env-vars"></a>Environmental Variables

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
"providerMicrosoftSecret": "microsoft-app-secret",
"providerCustomGoogleId": "google-app-id",
"providerCustomGoogleSecret": "google-app-secret"
```

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

## <a id="custom-authorizer"></a>Custom Authorizer

Custom Authorizer is deployed, but it is lacking some of the settings. Following settings should be modified.

1. Select deployed API
2. Select _Custom Authorizers_ from the side menu. Then select _authorize_ function from list
3. Edit the in the form
  * Name: _authorizer_, you can also rename it.
  * Lambda region: Select the region where your _authorize_ function is deployed
  * Lambda function: This is the _authorize_ function in authentication folder
  * Identity token source: _method.request.header.Authorization_
  * Token validation expression: _.*_
  * Result TTL in seconds: 0

Click _Update_.

## The Structure

* authentication/signin
  * endpoint: /authentication/signin/{provider}, redirects to oauth provider login page
  * handler: signin function creates redirect url to oauth provider
* authentication/callback
  * endpoint: /authentication/callback/{provider}, redirects back to client webapp with token url parameter
  * handler: function is called by oauth provider with `code` parameter
* authentication/authorize
  * endpoint: no end point
  * handler: is used by Api Gateway custom authorizer
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
