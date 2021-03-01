---
layout: post
title: Local development needs a reverse proxy
---

Another day, another problem. I need to replicate the production deployment, 
which consists of multiple services running on different domains. I cannot 
do that purely relying on `localhost` because I must test cookies and local 
storage behaviour between redirects. Modifying the `/etc/hosts` file alone 
does not help because the `port` number is not supported. It seems that hosts 
file changes should be accompanied by some locally running reverse proxy to 
map domains to ports correctly.
