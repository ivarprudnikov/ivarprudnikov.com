ivarprudnikov.com
=================

Repo moved/copied from [older ip repo](https://github.com/ivarprudnikov/ip)

# Description

[Portfolio site](http://ivarprudnikov.com) that initially had serverside component to make email form function (can see in git history first 10 commits).
But now is a basic site hosted on github.

## Installation/setup

*Prerequisites*

- npm - comes bundled with [node.js](https://nodejs.org)
- [bower](http://bower.io/) - installed via npm

1. `git clone thisRepo && cd thisRepo`
2. `npm install && bower install`

### Running in development environment

`grunt serve` - will start server and watch for source file changes

### Running production environment

`grunt serve:dist` - will build production assets and start server with them being on root 

## Deployment

`gh-pages` branch should be set up first by (`git checkout --orphan gh-pages`)

Then just build files and copy assets to `gh-pages` branch by using prepared script:

1. `grunt build`
2. `./deploy_to_github.sh`

