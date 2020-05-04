---
layout: post
toc: true
title: Micronaut API with JWT authentication on AWS Lambda 
image: /assets/micronaut-lambda.jpg
image_caption: "Micronaut and AWS Lambda"
---

Quite often [JWT tokens](https://jwt.io/) are used to authenticate API requests‍. In previous example I got them issued by [Auth0](https://auth0.com/):

* [Auth0 authentication in a React website](/auth0-authentication-website-react/)

It was necessary to provide an API example. Initially [Spring Boot](https://spring.io/projects/spring-boot) was an approach I thought of (also have it running in production). At the same time I needed a live API - a demo. I did not want to pay for an idle server so [AWS Lambda](https://aws.amazon.com/lambda/) was a perfect candidate, unfortunately it does not play well with Spring Boot or any other JVM alternative for that matter (that is another topic). Until I tried [Micronaut](https://micronaut.io/).

**Tech used:**

* Framework: Micronaut `v1.4`
* Build system: Gradle
* Source language: Kotlin
* Deployment: AWS SAM template and CLI
* Short GraalVM example uses Docker and shell script

## Constraints or "What is wrong with Spring"

On serverside and JVM my experience is shaped by [Grails](https://grails.org/) and [Spring Boot](https://spring.io/projects/spring-boot). Both of the frameworks use [Spring](https://spring.io/) under the hood and are great. Unfortunately they are meant for larger applications and when you need something with just a handful of API requests, something like a microservice then they feel a bit of an overkill. Do not get me wrong, you could have those with just couple of API requests in them, but I think the main problem will be the startup time. In general Spring relies much on runtime, therefore your "microservices" will struggle to start quickly in environments such as AWS Lambda. If you build apps, and your deployment pipeline copes well with slow startups then all is great, not in my case though.

If you're thinking that [GraalVM](https://www.graalvm.org/) could solve startup time issue by compiling application into native binary file you might be right. 
[On the separate branch of this example](https://github.com/ivarprudnikov/auth0-micronaut-template/tree/aws-lambda-graalvm) I did GraalVM implementation and deployed it to AWS. 
The development experience kind of sucks as you have to tweak your code to make sure it compiles to native. 
Compilation takes quite some time. So you tweak the code until it works and then do not touch it. 
Almost like functional tests, when they fail it is usually painful to fix them. 

## Micronaut?

It was on my radar for some time. Mainly because [Micronaut](https://micronaut.io/) is developed by the same people behind [Grails](https://grails.org/) which I used for quite some time and still need to maintain. Their selling points (_my humble interpretation_) are: reduced reliance on runtime, Spring like development environment, integrated Lambda support, mix and match approach, etc. Latter is similar to Spring Boot where you can build with Gradle or Maven, use Java, Kotlin or Groovy. But is it worth learning another framework, why not [Ratpack](https://ratpack.io/) or [Dropwizard](https://www.dropwizard.io/) then?

It is not gonna be "which framework is better" post, so I'll cut it short. I chose to try [Micronaut](https://micronaut.io/) because I knew people behind it, their examples looked to me like Spring Boot and Grails, and they claimed to support AWS Lambda. Last bit was most important as I need demo to be live but pay only for execution.

### Adopting early

It will take only couple of hours I thought. Yeah, right. As with all early adoptions there are issues, mainly because of active development, bugs, gaps in supporting all the things. You see examples in docs, blog posts and Github repositories but they sort of are all a bit different. What is more it can be written in three different languages, built with Maven or Gradle and tested in a couple more ways, which means there is no consistency per se.

It took me a while to write a trivial API and make sure it actually works without issues. On the other hand I witnessed active development, bug fixing and feature development which looks very promising. Their [Gitter](https://gitter.im/micronautfw/questions) is quite active, had found couple of answers there when developing.

## The API

As mentioned above there is a [simple React website](https://github.com/ivarprudnikov/react-auth0-template). It integrates with [Auth0](https://auth0.com/) to authenticate users and obtain [JWT tokens](https://jwt.io/). Those then can be sent to an API and used as a means to authenticate requests.

For my own purposes it was necessary to have just 2 endpoints:

* `GET /` - anonymous API status check
* `GET /me` - authenticated endpoint returning user details 

## Application

There are multiple ways to kick-start development and at the time I just wrote most by hand. There are easier ways:

* Generate project in the online builder - [micronaut.io/launch](https://micronaut.io/launch/)
* Download the framework (or use [Sdkman](https://sdkman.io/) to install it) and use [CLI](https://docs.micronaut.io/latest/guide/index.html) `$ mn create-app hello-world`

### Entry point

Just to visualize the simplicity of an application class.

```kotlin
package com.example
import io.micronaut.runtime.Micronaut
object Application {
    @JvmStatic
    fun main(args: Array<String>) {
        Micronaut.run(Application.javaClass)
    }
}
```

### Anonymous endpoint

As part of the application lets set up a simple controller with a method to respond to requests on the root path. Looks like Spring Boot.

```kotlin
package com.example

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

To my surprise the support for JWT tokens is baked in and there is not much you need to do to enable it. 

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

I'm heavily relying on defaults here, but as you might see `ip-patterns: []` crept in, which was causing me some issues at the time. Made sure no patterns are set so that any IP address is allowed.

**Auth0 JWT config**

I am relying on JWT tokens that were signed with RS256 and can be verified with JSON Web Key Set (JWKS). Auth0 make those keys publicly available, and you can find an endpoint in the console (Application > Settings > Advanced > OAuth > JSON Web Key Set). Let's extend `application.yml` config file ([docs](https://micronaut-projects.github.io/micronaut-security/latest/guide/#jwks)):

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

The API is sort of finished. [In the example](https://github.com/ivarprudnikov/auth0-micronaut-template) there are tests as well, but I'll skip them here for brevity. CORS is also enabled but it is similar to security and takes only couple of lines in the config to do ([docs](https://docs.micronaut.io/latest/guide/index.html#cors)). 

All looks very simple and quite terse. Unfortunately it did not take me minutes but hours as you need to read through 
much of documentation to understand how it can be glued together to reflect particular needs and how security can be
configured. That empty array of IP filters was a difficult to find solution also, took me quite some time to find
out why my requests were rejected in AWS Lambda.

## AWS Lambda

So far it was an application which was created, but Lambda needs to be more like a function. There is a 
project that bridges this gap in java world - [`aws-serverless-java-container`](https://github.com/awslabs/aws-serverless-java-container).
It relies on [API Gateway's](https://docs.aws.amazon.com/apigateway/index.html) proxy integration where you map an endpoint like `/foo/{proxy+}`. 
When `/foo/bar` gets invoked your Lambda implementation will be able to handle `/bar`. 
This way it is possible to do small services that own a set of endpoints in a given path.

### Proxy request handler

It's Micronaut and there is [native support for proxy integration](https://micronaut-projects.github.io/micronaut-aws/latest/guide/#apiProxy) 😆.

```groovy
dependencies {
  // ...
  // AWS proxy integration
  implementation("io.micronaut.aws:micronaut-function-aws-api-proxy")
}
```

Now we need to bootstrap whole application when proxy request hits this handler. 

```kotlin
package com.example

import com.amazonaws.serverless.exceptions.ContainerInitializationException
import com.amazonaws.services.lambda.runtime.Context
import com.amazonaws.services.lambda.runtime.RequestStreamHandler
import io.micronaut.function.aws.proxy.MicronautLambdaContainerHandler
import io.micronaut.security.filters.SecurityFilter
import java.io.IOException
import java.io.InputStream
import java.io.OutputStream

@Suppress("unused")
class StreamLambdaHandler : RequestStreamHandler {
    private var handler: MicronautLambdaContainerHandler

    init {
        try {
            handler = MicronautLambdaContainerHandler()
            // Slow coldstart on AWS Lambda when Security is enabled
            // https://github.com/micronaut-projects/micronaut-aws/issues/205
            handler.applicationContext.getBean(SecurityFilter::class.java)
        } catch (e: ContainerInitializationException) { // if we fail here. We re-throw the exception to force another cold start
            e.printStackTrace()
            throw RuntimeException("Could not initialize Micronaut", e)
        }
    }

    @Throws(IOException::class)
    override fun handleRequest(inputStream: InputStream?, outputStream: OutputStream?, context: Context?) {
        handler.proxyStream(inputStream, outputStream, context)
    }
}
```

At this point application is ready to be deployed to Lambda.
 
### Serverless application model

To use [AWS SAM](https://aws.amazon.com/serverless/sam/) we need couple of things:

* JAR file
* SAM template with Lambda parameters
* Build script which deploys assets to AWS

#### JAR file

Most likely the project was bootstrapped for you and build tasks were correctly set up.
Everything you need to do is be able to run `./gradlew clean build --info` to compile 
and produce a JAR.

#### SAM template

Fortunately the API is trivial and there is not much to configure in [SAM template](https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md). If there is something the spec does not have then check [Cloudformation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/template-anatomy.html) as SAM was built on top of it.

Let's add some [global params](https://github.com/awslabs/serverless-application-model/blob/master/docs/globals.rst):

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Description: Micronaut server utilizing proxy requests through API Gateway
Globals:
  Function:
    Runtime: java8
    Timeout: 20
    # more memory, more CPU, better startup, but more expensive
    MemorySize: 1024
  Api:
    EndpointConfiguration: REGIONAL
    # https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md#cors-configuration
    Cors:
      AllowOrigin: "'https://ivarprudnikov.github.io'"
      AllowCredentials: true
      AllowHeaders: "'*'"
      AllowMethods: "'*'"
```

Above CORS config was a bit of a hassle for me. Micronaut was not able to handle it well.
I've explicitly told Lambda to allow requests originating from the website. 
[Github issue #271](https://github.com/micronaut-projects/micronaut-aws/issues/271).

**The function**

```yaml
Resources:
  MainFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: my-micronaut-server-function
      Description: Micronaut server running behing StreamLambdaHandler
      CodeUri: build/libs/demo-1.0-all.jar
      Handler: com.example.StreamLambdaHandler::handleRequest
      Events:
        # hardcoded root / endpoint, otherwise locally does not respond
        RootEndpoint:
          Type: Api
          Properties:
            Path: /
            Method: any
        GetResource:
          Type: Api
          Properties:
            Path: /{proxy+}
            Method: any
```

Just to make our lives easier it is helpful to define _outputs_. They will be displayed 
in AWS Lambda console and will be printed after deployment.

```yaml
Outputs:
  ApiUrl:
    # here /Prod refers to implicitly created Prod stage
    Description: Main lambda endpoint
    Value: !Sub 'https://${ServerlessRestApi}.execute-api.${AWS::Region}.amazonaws.com/Prod/'
  MainFunction:
    Description: Lambda function ARN
    Value: !GetAtt MainFunction.Arn
```

#### Build script

We're almost there. Couple of lines of code will store required artifacts in S3 bucket. Then 
will deploy the JAR to Lambda. Following assumes `awscli` and `aws-sam-cli` are installed.

```sh
#!/bin/sh -e
NAME="${LAMBDA_APP_NAME:?Unique app name required}"
# Create S3 bucket used for deployment if one does not yet exist
if aws s3 ls s3://${NAME} 2>&1 | grep -q 'NoSuchBucket'; then
    aws s3 mb s3://${NAME}
fi
sam package --output-template-file packaged.yaml --s3-bucket ${NAME}
sam deploy --template-file packaged.yaml \
        --stack-name ${NAME} \
        --capabilities CAPABILITY_IAM
```

## Bonus: native binary with GraalVM 

Although Micronaut deals with various issues and makes sure application starts up as fast as it can, it is not perfect. I've experienced slow startup times initially. They were somewhat solved in newer versions of framework. Another approach is to take your JAR file and just make a native binary out of it with the help of [GraalVM](https://www.graalvm.org/docs/reference-manual/native-image/). It takes some time and fiddling, but the end result is almost worth it.

Not gonna go into details here. Same example but compiled to native binary is [on the separate branch](https://github.com/ivarprudnikov/auth0-micronaut-template/tree/aws-lambda-graalvm). In short you need:

* [GraalVM support dependencies for Micronaut](https://docs.micronaut.io/1.0.x/guide/index.html#graal)
* Docker service to pull and use [GraalVM image](https://hub.docker.com/r/oracle/graalvm-ce/)
* Remove `StreamLambdaHandler`, another entry point will be used `io.micronaut.function.aws.runtime.MicronautLambdaRuntime`

**Helper Docker image**

Will have `native-image` installed and set to be an entrypoint.

```dockerfile
FROM oracle/graalvm-ce:20.0.0-java8 as graalvm
# Install native-image https://www.graalvm.org/docs/reference-manual/native-image/
RUN gu install native-image
VOLUME ["/func"]
WORKDIR /func
# main command to run when running the image
ENTRYPOINT ["native-image"]
# default args to entrypoint will print help
CMD ["--help"]
```

**Shell script - converter**

```sh
#!/bin/bash

DOCKER_IMAGE_NAME=graalvm
EXECUTABLE_NAME=serverbin
MAIN_CLASS=io.micronaut.function.aws.runtime.MicronautLambdaRuntime
APP_JAR=build/libs/demo-1.0-all.jar

./gradlew clean build --info
if [[ $? -ne 0 ]]; then
    echo "Gradle build failed"
    exit 1
fi

if [[ "$(docker images -q ${DOCKER_IMAGE_NAME} 2> /dev/null)" == "" ]]; then
    docker build . -t ${DOCKER_IMAGE_NAME}
fi

docker run --rm -it -v $(pwd):/func ${DOCKER_IMAGE_NAME} \
  -H:+TraceClassInitialization \
  -H:+ReportExceptionStackTraces \
  -H:-AllowVMInspection \
  -H:Name=${EXECUTABLE_NAME} \
  -H:Class=${MAIN_CLASS} \
  -H:IncludeResources=logback.xml\|application.yml \
  --no-server \
  --no-fallback \
  -cp ${APP_JAR}
```

## Source files

The example application lives in a Github repo [ivarprudnikov/auth0-micronaut-template](https://github.com/ivarprudnikov/auth0-micronaut-template). It is deployed to AWS Lambda. The API is used when pulling profile details in [ivarprudnikov.github.io/react-auth0-template](https://ivarprudnikov.github.io/react-auth0-template/).

GraalVM example is on another branch [ivarprudnikov/auth0-micronaut-template/tree/aws-lambda-graalvm](https://github.com/ivarprudnikov/auth0-micronaut-template/tree/aws-lambda-graalvm) and is also deployed to AWS Lambda.

