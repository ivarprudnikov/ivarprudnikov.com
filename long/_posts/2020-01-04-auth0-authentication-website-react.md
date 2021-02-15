---
layout: post
title: Auth0 authentication in a React website
toc: true
image: /assets/auth0-login-dialog.png
---

In a couple of posts I'll go through setup of Auth0 authentication for your website (React.js) and [API server](/micronaut-kotlin-jwt-secured-api-aws-lambda/) followed with examples in GitHub repositories. Primary reason for writing/documenting this is to cut down time next time I need to set it all up again.

## Objective

Current post will cover the following:

- Set up of new [Auth0.com](https://auth0.com/) _application_
- Bootstrap of basic React website
- Custom hook and integration with Auth0 SDK by following example steps
- Further enhancements

### About

Authentication is a sensitive subject and there are many permutations and possibilities of its implementation. Figuring out the constraints of the system is a first step in the right direction.

For almost any commercial website out there in the wild a login and/or signup is a must. Whether it is a user profile that needs to be filled, or maybe user is contributing content to the system, or it is a subscription based API access - people are expected to land on some screen or get a popup asking for some sort of credentials to be able to continue. First thing first - you need to know your audience and preferably how often they will access the system and how many new users will possibly come to your site every once in a while, with this knowledge it is easier to choose a better approach.

Current example - [Auth0](https://auth0.com/) - might be suitable for businesses that do not expect infinite amounts of user signups otherwise it could become [quite expensive](https://auth0.com/pricing/). On the other hand if you have hundreds of thousands of users then money should not be a problem.

### Alternatives

Some other user authentication solutions/products to consider:

- [Amazon Cognito](https://aws.amazon.com/cognito/)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Okta](https://www.okta.com)

## Basic setup

You should know that Auth0 provides some useful examples both on their website as posts and on GitHub, I'll follow their steps before applying my changes:
- [github.com/auth0-samples/auth0-react-samples](https://github.com/auth0-samples/auth0-react-samples)
- [auth0.com/docs/quickstart/spa/react](https://auth0.com/docs/quickstart/spa/react)

### Setup on Auth0.com

In essence you need a couple of things, first create an _application_ and then update some minor details in settings to be able to login when running locally. Application _addons_ and _connections_ (those are additional settings) are left with default values.

#### Create Auth0 application

Picture below shows their dialog for creating an application.

<div class="d-flex justify-content-center align-items-start mb-4">
  <figure class="flex-fill text-center figure">
    <img class="img-fluid" alt="auth0 create application dialog" src="/assets/auth0-create-application-dialog.png" />
    <figcaption class="figure-caption">
      Create application in Auth0.com
    </figcaption>
  </figure>
</div>

#### Update application settings

- Name - `Auth0 React example`
- Application Type - `Single Page Application`
- Allowed Callback URLs - `http://localhost:3000`
- Allowed Web Origins - `http://localhost:3000`
- Allowed Logout URLs - `http://localhost:3000`
- Allowed Origins (CORS) - `http://localhost:3000`

All the rest are left to their default values. I do also use `localhost:3000` as this is what react app will use locally.

### Basic React website

Provided there are so many examples of react app structure I will stick to using `create-react-app` scripts - it will give some basic recognizable structure to the app. To keep things simple I will also use react router with just a couple of routes.

```
$ npx create-react-app test-auth0-react-login
```

Above will produce the following directory structure ([git commit](https://github.com/ivarprudnikov/react-auth0-template/commit/54eca60a89e3dce1eb895f7276e9cf9f8f5914bf)) in a newly created directory `test-auth0-react-login`:

```text
.
├── node_modules/
│   └── **
├── public/
│   ├── favicon.ico
│   ├── index.html
│   ├── logo192.png
│   ├── logo512.png
│   ├── manifest.json
│   └── robots.txt
├── src/
│   ├── App.css
│   ├── App.js
│   ├── App.test.js
│   ├── index.css
│   ├── index.js
│   ├── logo.svg
│   ├── serviceWorker.js
│   └── setupTests.js
├── README.md
├── package-lock.json
└── package.json
```

### Add login/signup

Auth0 documented steps in [auth0.com/docs/quickstart/spa/react](https://auth0.com/docs/quickstart/spa/react):

- [Install `npm` dependencies](https://auth0.com/docs/quickstart/spa/react#install-dependencies) ([git commit](https://github.com/ivarprudnikov/react-auth0-template/commit/414432c6e6b14eb84097a42dc7d01d0a6db16b33))
- [Create react-router's history instance](https://auth0.com/docs/quickstart/spa/react#create-react-router-s-history-instance) ([git commit](https://github.com/ivarprudnikov/react-auth0-template/commit/5c0561deeeddf9201ff06eb2649cb74afdcc674b))
- [Create custom Auth0 hook](https://auth0.com/docs/quickstart/spa/react#install-the-auth0-react-wrapper) ([git commit](https://github.com/ivarprudnikov/react-auth0-template/commit/4b0413db5a3ef52153cc16d14134ba84360711ff))
- [Create NavBar that uses custom Auth0 hook](https://auth0.com/docs/quickstart/spa/react#create-the-navbar-component) ([git commit](https://github.com/ivarprudnikov/react-auth0-template/commit/07a26fe92b12f5ac1024f2bf964b0744e5e023b2))
- [Integrate the SDK](https://auth0.com/docs/quickstart/spa/react#integrate-the-sdk)
    - Add Auth0 config ([git commit](https://github.com/ivarprudnikov/react-auth0-template/commit/6a9b7254a5c64b9fb08cfdf4be532190d3e81ac6))
    - Wrap application in Auth0Provider ([git commit](https://github.com/ivarprudnikov/react-auth0-template/commit/710f0bb9760b9f74e6474ae4cc5181672d3f0c7b))
    - Replace generated homepage and use NavBar with login button ([git commit](https://github.com/ivarprudnikov/react-auth0-template/commit/32956d4c67ac4b016dbac975485378ce948247fc))

So far it is a basic login experience as visible in the _gif_ image below. 

<div class="d-flex justify-content-center align-items-start mb-4">
  <figure class="flex-fill text-center figure">
    <img class="img-fluid" alt="auth0 create application dialog" src="/assets/auth0-react-basic-login-working.gif" />
    <figcaption class="figure-caption">
      Login is working
    </figcaption>
  </figure>
</div>

### Profile page

I'm still following [Auth0 steps here](https://auth0.com/docs/quickstart/spa/react#read-the-user-profile):

- Add profile component ([git commit](https://github.com/ivarprudnikov/react-auth0-template/commit/e17d175d08a2d736e94ad4fdb2d5355d5a69baed))
- Add routes and update NavBar ([git commit](https://github.com/ivarprudnikov/react-auth0-template/commit/f2fe93e7f1784372c9ae26f3401a0c9a80afe0b0))
- [Protect routes with new PrivateRoute component](https://auth0.com/docs/quickstart/spa/react#secure-the-profile-page) ([git commit](https://github.com/ivarprudnikov/react-auth0-template/commit/50b1cd7f523dc112208b83f021c0c4113db32b00))

## Further enhancements

Before website is deployed it seems to be optional but helpful to improve existing implementation. It comes from experience of running similar authentication implementation in production.

### Update Auth0 hook

**Remove popup login option** I am not keen on using popup login due to couple of issues: 
- popup would not always open in the same display when you have multiple of those,
- it does not work on all browsers the same way (remember EasyXDM?)

**Get and decode access token** to have more details about the authentication like roles and scopes. This is not the same as primary ID token.

```javascript
const getTokenSilently = async () => {
    const accessToken = await auth0Client.getTokenSilently();
    return { raw: accessToken, decoded: jwt_decode(accessToken) };
};
```

**Set defaults in useState()** instead of Auth0 example ones where they use `undefined`.

```javascript
const [isAuthenticated, setIsAuthenticated] = useState(false);
const [user, setUser] = useState(null);
const [auth0Client, setAuth0] = useState(null);
const [loading, setLoading] = useState(true);
```

**Import config directly** instead of relying on props do import configuration file in the hook itself. Also **ask for scopes** we want to see all possible scopes user might have after they log in.

```javascript
import config from './auth_config';

//...

const auth0FromHook = await createAuth0Client({
    domain: config.domain,
    client_id: config.clientId,
    scope: config.scope,
    redirect_uri: config.loginCallbackUrl
});
```

**Scope check helper** Ability to check if user has an expected scope.

```javascript
const hasAnyScopeAsync = async (scopes) => {
    const token = await getTokenSilently();
    const tokenScopes = (token.decoded.scope || '').split(/\W/);
    return scopes && scopes.length && scopes.some(s => tokenScopes.indexOf(s) > -1);
};
```

**Add logout redirect url** Redirect user to homepage after logging out.

```javascript
const logoutWithRedirect = () => auth0Client.logout({
  returnTo: config.logoutRedirectUrl
});
```

### Additional changes

- Hint on expected Node.js version through `.nvmrc` file and set version to `12`.
- Add `"homepage"` property to `package.json` to generate correct links when deploying to GitHub pages.
- Use "homepage" (from package.json) as production redirect uri.
- Add production URLs to Auth0 config, in my case:
  - Allowed Callback URLs - `http://localhost:3000, https://ivarprudnikov.github.io/react-auth0-template`
  - Allowed Web Origins - `http://localhost:3000, https://ivarprudnikov.github.io`
  - Allowed Logout URLs - `http://localhost:3000, https://ivarprudnikov.github.io/react-auth0-template`
  - Allowed Origins (CORS) - `http://localhost:3000, https://ivarprudnikov.github.io`
- Add build version number (timestamp) to make sure `index.html` always changes upon every build.
- Add Bootstrap styling

## Source code and demo

For the purposes of a demo source code is deployed and hosted on GitHub pages.

- Source code - [ivarprudnikov/react-auth0-template](https://github.com/ivarprudnikov/react-auth0-template)
- Live demo - [https://ivarprudnikov.github.io/react-auth0-template/](https://ivarprudnikov.github.io/react-auth0-template/)
