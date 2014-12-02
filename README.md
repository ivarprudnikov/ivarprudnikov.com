ivarprudnikov.com
=================

Repo moved from "ip"

# Description

## Requirements

- npm
- bower
- elastic beanstalk cli for deployments

## Installation

```sh
git clone thisRepo
npm install && bower install
```

### Running dev

```sh
grunt server
```

### Running prod

```sh
grunt build
npm start
```

## Deployment

Requirement is to have `eb_deployment` directory with `git init` & `eb init` already done.

```sh
grunt deploy
```

