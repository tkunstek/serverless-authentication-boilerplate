#serverless-authentication-boilerplate

This project is aimed to be generic authentication library for serverless (http://www.serverless.com) and is still very much work-in-progress state.

test page: http://laardee.github.io/serverless-authentication-gh-pages

providers:

* facebook https://github.com/laardee/serverless-authentication-facebook
* google https://github.com/laardee/serverless-authentication-google
* windows live https://github.com/laardee/serverless-authentication-microsoft

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