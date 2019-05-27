---
layout: post
title: "GitHub login OAuth flow with AWS Lambda"
toc: true
---

May 2019. In a need of Github access token to interact with their API. Adding _"Login with GitHub"_ button should not require deployment of your own serverside app. _Sigh_.

## Background story

As it happens a tiny fraction of my development time is spent filling in timesheets describing what I do. It helps with budgeting, invoicing, development focus. Despite its usefulness it is quite easy to forget to add an entry just before you head home, it happens and again, and again. Sometimes it all accumulates and suddenly someone has to fill in lengthy time gaps. 

Almost all of that work is done with using _Git_ and as it happens most of it is in _GitHub_. One obvious way is to look into commit activity and extract all projects for which I made commits in a given time frame which in turn allows me to fill in
those time gaps. AFAIK there is no easy way to do it. For the very reason I [wrote a `bash` script](https://github.com/ivarprudnikov/my_commit_history) that goes through 
all relevant repositories, checks them out and filters out `git log` to include commits made by me. It helps but it takes some time before all relevant repositories are cloned, it is also not very user friendly and hard to extend and maintain. What is more the authentication requires me to look up _GitHub Personal access token_ every time I want to use the script, just because I cannot memorize it and it would be naive to store something powerful just for the sake of this script.

### Light Bulb moment

Why am I bothering myself with this `bash` script when I could write a simple website which will have _"Login with GitHub"_ to obtain the token and then use it against GitHub API. This would allow to make meaningful UI and might even help some Joe Bloggs who suffers from the same lack of discipline as I do.

Website hosting is dead cheap these days, one could even say it is almost free. But GitHub OAuth usage requires deployment of a server side application which increases costs compared to just having a static website somewhere on _AWS S3_. 

An alternative to a full scale server-side application might be usage of _Serverless architecture_ where units of work are split and then being run on demand, it is also touted to be cheaper due to the fact that customer is not charged for idle compute time. In other words - no website visitors, no payment necessary.

## GitHub OAuth flow

// insert flow diagram

## OAuth and website

// how does it affect SPA

## Splitting flow into lambdas

// Lambda + Api Gateway + CloudFront => Cloudformation => SAM => Wut?

## Devops

// deployment of website

// deployment of functions

## Summary

// how hard it is
// is it worth the time/money
