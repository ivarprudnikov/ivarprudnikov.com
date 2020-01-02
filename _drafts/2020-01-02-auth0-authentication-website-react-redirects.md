---
layout: post
title: Auth0 authentication in a React website
toc: true
---

In a couple of posts I'll go through setup of Auth0 authentication for your website (React.js) and API server (Springboot) followed with examples in GitHub repositories. Primary reason for writing/documenting this is to cut down time next time I need to set it all up again.

## Some context

Authentication is a sensitive subject and there are many permutations and possibilities of its implementation. Figuring out the constraints of the system is a first step in the right direction.

For almost any commercial website out there in the wild a login and/or signup is a must. Whether it is a user profile that needs to be filled, or maybe user is contributing content to the system, or it is a subscription based API access - people are expected to land on some screen or get a popup asking for some sort of credentials to be able to continue. First thing first - you need to know your audience and preferably how often they will access the system and how many new users will possibly come to your site every once in a while.

For this particular example I'll assume a website targeted at your _local community_, or a specific group of people like _carers_, or a narrow topic such as _research in optogenetics_. It will reflect usual focus local business has as not all of us are building global unicorns.

Now it is safe to predict that amount of users has some sort of upper bound and will not require sophisticated decisions when you need to accommodate 50 million accounts. This gives you some breathing space and allows to further gather information about your future users, what devices they use (mobile, tablets, PCs), would they have and know how to use social login, will they understand OTP with an SMS, do they know what second factor is, do they like using passwords with special characters, etc.

In other cases the constraints are going to be dictated by the choice of programming language which in turn will have one or two most used security _plugins_ or _frameworks_. This will be covered more when protecting API endpoints.

When working on the web platform (I mean browsers) there are couple of things you can do but they depend on why you want your users to login/signup. Provided there is no API yet let's assume we want to be able for the users to access a part of application where they can see their profile details stored after signup.

## Basic setup

### Setup on Auth0.com

You should know that Auth0 provides some useful examples both on their website as posts and on GitHub, I'll follow their steps before applying my changes:
- [github.com/auth0-samples/auth0-react-samples](https://github.com/auth0-samples/auth0-react-samples)
- [auth0.com/docs/quickstart/spa/react](https://auth0.com/docs/quickstart/spa/react)

In essence you need a couple of things, first create an _application_ and update some minor details in settings to be able to login when running locally. For now will leave defaults in application addons and connections (those are additional settings).

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

### Create basic React website

Provided there are so many examples of react app structure I will stick to using `create-react-app` scripts - it will give some basic recognizable structure to the application. To keep things simple I will also use react router with just a couple of routes.

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

### Add Auth0 signup/login to website

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

### Add profile page

I'm still following [Auth0 steps here](https://auth0.com/docs/quickstart/spa/react#read-the-user-profile):

- Add profile component ([git commit](https://github.com/ivarprudnikov/react-auth0-template/commit/e17d175d08a2d736e94ad4fdb2d5355d5a69baed))
- Add routes and update NavBar ([git commit](https://github.com/ivarprudnikov/react-auth0-template/commit/f2fe93e7f1784372c9ae26f3401a0c9a80afe0b0))
- [Protect routes with new PrivateRoute component](https://auth0.com/docs/quickstart/spa/react#secure-the-profile-page) ([git commit](https://github.com/ivarprudnikov/react-auth0-template/commit/50b1cd7f523dc112208b83f021c0c4113db32b00))

## Preparing for production

### Users database
### Second factor
### Social login
