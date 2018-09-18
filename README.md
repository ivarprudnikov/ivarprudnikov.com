ivarprudnikov.com
=================

On 17 Sep 2018 site was revamped to use [Jekyll as a static site generator](https://help.github.com/articles/using-jekyll-as-a-static-site-generator-with-github-pages/)

> Dis me blog

## Running locally

Check whether you have Ruby 2.1.0 or higher installed:
```bash
$ ruby --version
ruby 2.X.X
```

Install Bundler:
```bash
$ gem install bundler
# Installs the Bundler gem
```

Install Jekyll and other dependencies from the GitHub Pages gem:
```bash
$ bundle install
Fetching gem metadata from https://rubygems.org/............
Fetching version metadata from https://rubygems.org/...
Fetching dependency metadata from https://rubygems.org/..
Resolving dependencies...
```

**Run locally**

```bash
$ bundle exec jekyll serve
Configuration file: /Users/hacker/cloned/repo/_config.yml
            Source: /Users/hacker/cloned/repo/
       Destination: /Users/hacker/cloned/repo/_site
 Incremental build: disabled. Enable with --incremental
      Generating... 
                    done in 1.06 seconds.
 Auto-regeneration: enabled for '/Users/hacker/cloned/repo'
    Server address: http://127.0.0.1:4000/
  Server running... press ctrl-c to stop.
```
