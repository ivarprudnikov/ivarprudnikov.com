---
layout: post
title: Scanning Kubernetes config
---

It is pretty easy to configure application clusters in Kubernetes.
The issue is how not to make a mistake by missing something. How to avoid the situation where your configuration is "Vulnerable by design"?

I've looked into a couple of tools recently:

- [Open Rewrite](https://docs.openrewrite.org/reference/recipes/kubernetes)
- [Checkov](https://www.checkov.io/)

Rewrite libraries are meant for more than just Kubernetes (think Java, Spring).
It is a tool to easily refactor your code and make sure you use the best practices.
As far as I saw, you must use one of the build tools to run it, e.g., Gradle.
I managed to come up with a simple example to prove its worth: [ivarprudnikov/openrewrite-kubernetes-example](https://github.com/ivarprudnikov/openrewrite-kubernetes-example)

Checkov, on the other hand, is a standalone tool that is focused on infrastructure as code.
There are many ways to install and run it. It does not depend on your build pipeline.
I did do two examples to see how it works:

- Kubernetes config scan [ivarprudnikov/kubernetes-scan-with-checkov](https://github.com/ivarprudnikov/kubernetes-scan-with-checkov)
- Helm config scan [ivarprudnikov/helm-scan-with-checkov](https://github.com/ivarprudnikov/helm-scan-with-checkov)

Both tools are great and fit different use cases.
