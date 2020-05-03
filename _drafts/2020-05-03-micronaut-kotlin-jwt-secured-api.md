---
layout: post
toc: true
title: Micronaut API server with JWT authentication 
---

More and more time I spend using JWT tokens to authenticate API requests. Most recently using [Auth0](https://auth0.com/); did reflect on it in recent posts:

* [Auth0 authentication in a React website](/auth0-authentication-website-react/)
* [Auth0 blocked me from logging in](/auth0-blocked-ip-cannot-login/)

As part of that first post I mentioned it was necessary to provide an API example that would consume [JWT tokens](https://jwt.io/) issued by [Auth0](https://auth0.com/). Initially [Spring Boot](https://spring.io/projects/spring-boot) was an approach I thought of (also have it running in production). But at the same time I needed a live API - a demo. I did not want to pay for an idle server so [AWS Lambda](https://aws.amazon.com/lambda/) was a perfect candidate, unfortunately it does not play well with Spring Boot or any other JVM alternative for that matter (that is another topic). Until I tried [Micronaut](https://micronaut.io/).

## Constraints or "What is wrong with Spring"

When speaking about serverside and JVM my experience is  shaped mainly by [Grails](https://grails.org/) and [Spring Boot](https://spring.io/projects/spring-boot). Both of the frameworks use [Spring](https://spring.io/) under the hood and are great. Unfortunately they are meant for larger applications and when you need something with just a handful of API requests, something like a microservice then they feel a bit of an overkill. Do not get me wrong, you could have those with just couple of API requests in them, but I think the main problem will be the startup time. In general Spring relies much on runtime so your "microservices" will struggle to start quickly in environments such as AWS Lambda. If you build apps and your deployment pipeline copes well with slow startups then all is great, not in my case though.

## Micronaut?

It was on my radar for some time. Mainly because [Micronaut](https://micronaut.io/) is developed by the same people behind [Grails](https://grails.org/) which I used for quite some time and still need to maintain. Their selling points are: reduced reliance on runtime, Spring like development environment, integrated Lambda support, mix and match approach, etc. Latter is similar to Spring Boot where you can build with Gradle or Maven, use Java, Kotlin or Groovy. But is it worth learning another framework, why not [Ratpack](https://ratpack.io/) or [Dropwizard](https://www.dropwizard.io/) then?

It is not gonna be "which framework is better" post so I'll cut it short. I chose to try [Micronaut](https://micronaut.io/) because I knew people behind it, their examples looked to me like Spring Boot and Grails and they claimed to support AWS Lambda. Last bit was most important as I need demo to be live but pay only for execution.

### Adopting early

It will take only couple of hours I thought. Yeah, right. As with all early adoptions there are issues, mainly because of active development, bugs, gaps in supporting all the things. You see examples in docs, blog posts and Github repositories but they sort of are all a bit different. Also the fact it can be written in three different languages, built with Maven or Gradle and tested in a couple more ways means there is no consistency per se.

So yeah it took me a while to write a trivial API and make sure it actually works without issues. But in this time I witnessed active development, bug fixing and feature development which looks very promising. Also their [Gitter](https://gitter.im/micronautfw/questions) is quite active, had found couple of answers there when developing.

## The API

As mentioned above there is a [simple React website](https://github.com/ivarprudnikov/react-auth0-template). It integrates with [Auth0](https://auth0.com/) to authenticate users and obtain [JWT tokens](https://jwt.io/). Those then can be sent to an API and used as a means to authenticate requests.

For my own purposes it was necessary to have just 2 endpoints:

* `GET /` - anonymous API status check
* `GET /me` - authenticated endpoint returning user details 

## Application

There are multiple ways to kick-start development and at the time I just wrote most by hand. But there are easier ways:

* Generate project in the online builder - https://micronaut.io/launch/
* Download the framework (or use [Sdkman](https://sdkman.io/) to install it) and use [CLI](https://docs.micronaut.io/latest/guide/index.html) `$ mn create-app hello-world`

### Entry point

Just to visualize the simplicity of an application class.

```kotlin
package foo.bar
import io.micronaut.runtime.Micronaut
object Application {
    @JvmStatic
    fun main(args: Array<String>) {
        Micronaut.run(Application.javaClass)
    }
}
```

### Anonymous endpoint

As part of the application lets set up a simple controller with a method to respond to requests on root path. Looks like Spring Boot.

```kotlin
package foo.bar

import io.micronaut.http.MediaType
import io.micronaut.http.annotation.Controller
import io.micronaut.http.annotation.Get
import io.micronaut.http.annotation.Produces

@Controller("/")
class IndexController {
    @Get
    @Produces(MediaType.TEXT_PLAIN)
    fun index(): String {
        return "UP"
    }
}
```

### Security and Auth0 JWT tokens

To my surprise support for JWT tokens is baked in and there is not much you need to do to enable it. 

Let's [enable security](https://micronaut-projects.github.io/micronaut-security/latest/guide/), you will need a 
dependency defined, eg. in `build.gradle` :

```groovy
dependencies {
    // ...
    implementation "io.micronaut:micronaut-security-jwt"
    kapt "io.micronaut:micronaut-security"
}
```

Then configure it in `application.yml` config file: 

```yaml
micronaut:
  application:
    name: foobar
  security:
    enabled: true
    ip-patterns: []
```

I'm heavily relying on defaults here, but as you might see `ip-patterns: []` crept in, which was causing me some issues 
at the time. Made sure that no patterns are set so that any IP address is allowed here.

**Auth0 JWT config**

I am relying on JWT tokens that were signed with RS256 and can be verified with JSON Web Key Set (JWKS). Auth0 make those 
keys publicly available and you can find an endpoint in the console. Let's extend `application.yml` config file 
([docs](https://micronaut-projects.github.io/micronaut-security/latest/guide/#jwks)):

```yaml
micronaut:
  security:
    enabled: true
    ip-patterns: []
    token:
      enabled: true
      jwt:
        enabled: true
        signatures:
          jwks:
            auth0:
              url: "https://ivarprudnikov.eu.auth0.com/.well-known/jwks.json"
```

That's it. Security is enabled and incoming Authorization tokens will be validated. 
More details in [security docs](https://micronaut-projects.github.io/micronaut-security/latest/guide/#jwt).

### Protected endpoint

Almost everything is done, let's decorate our controller and indicate that all methods will be accessible by default:

```kotlin
// ...
import io.micronaut.security.annotation.Secured
import io.micronaut.security.rules.SecurityRule

@Secured(SecurityRule.IS_ANONYMOUS)
@Controller("/")
class IndexController {
  // ...
}
``` 

And add a missing method `/me`:

```kotlin
import io.micronaut.security.authentication.Authentication
// ...
@Get("/me")
@Produces(MediaType.APPLICATION_JSON)
@Secured(SecurityRule.IS_AUTHENTICATED)
fun me(authentication: Authentication?): Authentication? {
    return authentication
}
```

The API is sort of finished. [In the example](https://github.com/ivarprudnikov/auth0-micronaut-template) there are tests 
as well but I'll skip them here for brevity. CORS is also enabled but it is similar to security and takes only couple 
of lines in the config to do ((docs)[https://docs.micronaut.io/latest/guide/index.html#cors]). 

All looks very simple and quite terse. Unfortunately it did not take me minutes but hours as you need to read through 
much of documentation to understand how it can be glued together to reflect particular needs and how security can be
configured. That empty array of IP filters was a difficult to find solution also, took me quite some time to find
out why my requests were rejected in AWS Lambda.

## AWS Lambda

TODO
