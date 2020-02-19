---
layout: post
toc: true
title: Auth0 blocked me from logging in
image: /assets/no-trespassing-michael-dziedzic.jpg
image_caption: Photo by Michael Dziedzic on Unsplash
---

To my surprise after writing a simple example which deals with Auth0 login I got blocked from logging into it.

## Sequence of events

Just after New Years Eve in the very beginnings of 2020 I did create a new account on _Auth0_. It was meant to be used for examples I was developing: React and Springboot. It was also a free account, there was no credit card involved.

I did finish my [React example on GitHub](https://github.com/ivarprudnikov/react-auth0-template), used Auth0 code samples that were then slightly improved. Source code was [published to GitHub pages](https://ivarprudnikov.github.io/react-auth0-template/). It contained required credentials of my newly created tenant on _Auth0_ side.

Login/Signup initially worked for me as expected. Implementation was not my first example of login but rather a timesaver for myself and other developers who would want to just fork it for a new React project.

In addition to having just code somewhere in the repository a simple blog post was also published - ["Auth0 authentication in a React website"](/auth0-authentication-website-react/).

Everything was working expected on a [published live example](https://ivarprudnikov.github.io/react-auth0-template/). Until I happened to check it again after couple of weeks.

## What failed

Once I tried to login the app just sat there waiting for something. Immediately I thought it was my crap React code, maybe there is a bug or something. My imagination could not blame _Auth0_ for that - I am using that stuff in production.

- Double checked internet connection - all good.
- Double checked for any runtime errors - all good.
- Double checked Auth0 configuration - all good.
- There was an update available in Auth0 dependency - updated that.
- Cleared cache.
- [Read about changes in session cookie handling](https://auth0.com/blog/browser-behavior-changes-what-developers-need-to-know/) - why not that, right?
- Checked if there are any logs in Auth0 dashboard - empty.

Finally my clinginess to various conspiracy theories ended up with an obvious hint - I've been a bad boy and I got blocked. Well I did not do anything terrible recently but wanted to check that basic assumption. And BINGO. Typed in my `/authorize` endpoint into [downforeveryoneorjustme.com](https://downforeveryoneorjustme.com/) and got the answer that I have no access to it. _Anymore_.

## Freemium madness

In the world of Freemium you learn to fix your own stuff as there is no _customer support_. I did attempt exactly that - went through all the bits in Auth0 dashboard searching for that magic button. Nothing, not a slightest hint to which IPs are blocked. Cannot even imagine how would I feel if that was a customer in production.

Another trouble was an [upcoming backend example](https://github.com/ivarprudnikov/springboot-auth0-template) which is far more complicated than React implementation, but there is an expectation of existing functioning website that uses JWT tokens obtained from Auth0. I could not continue working on backend until a login block was lifted.

## Getting some answers

At this point the levels of anxiety were going through the roof. I had to get some answers before refactoring my production servers to use another authentication provider.

### Support tickets

"Support Tickets" is a thing in their "Support center" but only for paid members which meant that I needed to post in their forums for someone to come back with an answer. Well I knew that my IP was blocked somehow so posting that in a forum does not really help you.

### Twitter

This social media platform is a great place to vent your anger and frustration so why not? After finding their handle _@auth0_ a [public tweet full of frustration](https://twitter.com/ivarPrudnikov/status/1229169710387941376) was sent. It is not the prettiest use of language I must agree, but anxiety was making a toll.

To my surprise responses were quick, but unfortunately they are not quick enough. More like _email reply_ quick.

## Summary

Still I am blocked and nobody cares.

- Think twice before using third party auth provider in production. 
- Freemium has its limits.
- Play with other auth providers - do not lock in. Otherwise you'll think this sort of issue is _normal_.
- Write publicly about similar issues.
- Auth0 definitely has some issues. Issues that could cost you customers and you would not even know they were blocked.
