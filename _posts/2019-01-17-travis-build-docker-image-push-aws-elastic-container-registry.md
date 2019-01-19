---
layout: post
title: Build Docker image on Travis CI and push it to AWS ECR
image: /assets/docker-travis-aws.svg
toc: true
---

If you are using AWS it is relatively easy to create a private Docker registry and after pushing some images, reference them when launching ECS/EB instances.

I'm gonna use Travis CI to build a docker image and then push it to ECR using `awscli`.

## Sample Dockerfile

We'll just use _Python 3_ image and execute simple command which prints to stdout:

```dockerfile
# Dockerfile
from python:3.6
CMD ["python", "-c", "print(12345)"]
```

To test out if it works I will build an image and then run it:

```bash
$ docker build -t foobar .


Sending build context to Docker daemon  2.048kB
Step 1/2 : from python:3.6
 ---> 3e4c2972dc8d
Step 2/2 : CMD ["python", "-c", "print(12345)"]
 ---> Running in 5e3273c46264
Removing intermediate container 5e3273c46264
 ---> c1d000f3a768
Successfully built c1d000f3a768
Successfully tagged foobar:latest
```

At this point image is built using `foobar` as a tag which I'll use next when running it:

```bash
$ docker run --rm -ti foobar

12345
```

Some explanations of above flags:
- `--rm` - Automatically remove the container when it exits
- `--tty` , `-t` - Allocate a pseudo-TTY
- `--interactive` , `-i` - Keep STDIN open even if not attached

## Travis CI configuration

Now that we have an image to work with it is time to build it using CI server. I'll start populating `.travis.yml` file to build above Dockerfile. There is an assumption that you know how to integrate with Travis CI to begin with:

```yaml
sudo: required
language: python
services:
- docker

script:
- docker build -t foobar .
```

## Pushing an image to ECR

After an image is built on Travis it is available for us to push it to the registry. Below steps are going to be somewhat similar if you want to push it to another private registry.

In order to push to ECR I'll use `deploy` stage Travis provides and will execute shell script at that time. Script will use Python `awscli` API to achieve that.

```bash
#!/bin/bash -e

# the registry should have been created already
# you could just paste a given url from AWS but I'm
# parameterising it to make it more obvious how its constructed
REGISTRY_URL=${AWS_ACCOUNT_ID}.dkr.ecr.${EB_REGION}.amazonaws.com
# this is most likely namespaced repo name like myorg/veryimportantimage
SOURCE_IMAGE="${DOCKER_REPO}"
# using it as there will be 2 versions published
TARGET_IMAGE="${REGISTRY_URL}/${DOCKER_REPO}"
# lets make sure we always have access to latest image
TARGET_IMAGE_LATEST="${TARGET_IMAGE}:latest"
TIMESTAMP=$(date '+%Y%m%d%H%M%S')
# using datetime as part of a version for versioned image
VERSION="${TIMESTAMP}-${TRAVIS_COMMIT}"
# using specific version as well
# it is useful if you want to reference this particular version
# in additional commands like deployment of new Elasticbeanstalk version
TARGET_IMAGE_VERSIONED="${TARGET_IMAGE}:${VERSION}"

# making sure correct region is set
aws configure set default.region ${EB_REGION}

# Push image to ECR
###################

# I'm speculating it obtains temporary access token
# it expects aws access key and secret set
# in environmental vars
$(aws ecr get-login --no-include-email)

# update latest version
docker tag ${SOURCE_IMAGE} ${TARGET_IMAGE_LATEST}
docker push ${TARGET_IMAGE_LATEST}

# push new version
docker tag ${SOURCE_IMAGE} ${TARGET_IMAGE_VERSIONED}
docker push ${TARGET_IMAGE_VERSIONED}
```

I do push 2 tags here, the `latest` one and the versioned one which will allow me to specify it when deploying to other AWS services. Keep in mind that [_ECR_ has some limits on maximum amount of tags and images](https://docs.aws.amazon.com/AmazonECR/latest/userguide/service_limits.html). 

As you see it also expects some environmental variables which I'll provide in `.travis.yml`. Below is updated script, assuming above one was named `docker_push.sh`:

```yaml
sudo: required
language: python
services:
- docker
env:
  global:
  - DOCKER_REPO=myorg/veryimportantimage
  - EB_REGION="eu-west-1"
  - secure: travisEncryptedAWS_ACCOUNT_ID
  - secure: travisEncryptedAWS_ACCESS_KEY_ID
  - secure: travisEncryptedAWS_SECRET_ACCESS_KEY
before_install:
- pip install awscli
- export PATH=$PATH:$HOME/.local/bin
script:
- docker build -t $DOCKER_REPO .
deploy:
  provider: script
  script: bash docker_push.sh
  on:
    branch: master
```

### Encrypting sensitive variables

Script expects us to pass 3 pieces of sensitive information:

- `AWS_ACCOUNT_ID`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

Luckily [Travis provides a way to encrypt those](https://docs.travis-ci.com/user/environment-variables/#encrypting-environment-variables), eg:

```bash
$ travis encrypt AWS_ACCOUNT_ID=super_secret --add
```

Above expects you are in a checked out repository if you use Github for example.

## Live example

Provided scripts (although bit modified sa more complicated) are used in one of my public repositories: [ivarprudnikov/char-rnn-tensorflow](https://github.com/ivarprudnikov/char-rnn-tensorflow)

You can also see [Travis CI builds in action](https://travis-ci.org/ivarprudnikov/char-rnn-tensorflow/builds/470705468)


