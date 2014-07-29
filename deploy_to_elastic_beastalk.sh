#!/bin/bash

# Expected eb_deployment dir to have "eb init" and "git init" done already
# "eb init" sets up the file eb_deployment/.elasticbeanstalk/config

cd eb_deployment
git update-ref -d refs/heads/master
git reset --hard

# Copy over prod files
rsync -av \
      --exclude='eb_deployment' \
      --exclude='client-dev' \
      --exclude='test' \
      --exclude='node_modules' \
      --exclude='.git' \
      --exclude='.idea' \
      --exclude='.gitignore' \
      .. .

# Change devDependencies to smth else so that aws does not install those
sed -ie s/devDependencies/customDependencies/ package.json

# Track and commit the working copy to the local repo
git add -A .
git commit -m "....."
git aws.push

# Remove used files
find . -type d \( -path ./.git -o -path ./.elasticbeanstalk \) -prune -o -print -execdir rm -rf {} +

# Reset repo
git update-ref -d refs/heads/master
git reset --hard


