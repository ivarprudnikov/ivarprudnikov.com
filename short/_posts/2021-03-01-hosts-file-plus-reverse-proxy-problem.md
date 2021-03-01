---
layout: post
title: Local dev environment needs a reverse proxy
---

Another day, another problem. I need to replicate the production deployment, 
which consists of multiple services running on different domains. I cannot 
do that purely relying on `localhost` because I must test cookies and local 
storage behaviour between redirects. Modifying the `/etc/hosts` file alone 
does not help because the `port` number is not supported. It seems that hosts 
file changes should be accompanied by some locally running reverse proxy to 
map domains to ports correctly.

**Hosts file**

One way of doing it is to start with the hosts file and intercept your service 
domain name resolution to point to localhost:

```shell
127.0.0.1 first.service.com
127.0.0.1 second.service.com
127.0.0.1 third.service.com
```

**Apache server**

Then configure your Apache server. Add virtual hosts to the config:

```shell
# additional config for local dev
<VirtualHost *:80>
    ServerName first.service.com
    ProxyPass / http://localhost:8080/
    ProxyPassReverse / http://localhost:8080/
</VirtualHost>
<VirtualHost *:80>
    ServerName second.service.com
    ProxyPass / http://localhost:8081/
    ProxyPassReverse / http://localhost:8081/
</VirtualHost>
<VirtualHost *:80>
    ServerName third.service.com
    ProxyPass / http://localhost:8082/
    ProxyPassReverse / http://localhost:8082/
</VirtualHost>
# end aditional config
```

**If you're on macOS Big Sur**

* Hosts file is in `/etc/hosts`
* Apache config is in `/etc/apache2/httpd.conf`
* Test your Apache config with `apachectl configtest`
* Enable/uncomment `proxy_module` and `proxy_http_module` in Apache config
* Enable/uncomment `Include /private/etc/apache2/extra/httpd-vhosts.conf` in Apache config - this is where I've added additional virtual hosts
* Flush DNS `sudo dscacheutil -flushcache` and `sudo killall -HUP mDNSResponder`

**Clear HSTS cache**

If your services are using `https` scheme then most likely your browser has cached  
HTTP Strict Transport Security requirement, meaning that it'll not use insecure `http`
scheme locally. If it is not cleared then your browser will not be able to reach the locally
running applications on `http` scheme and will keep using `https` which will fail to 
load the site due to above config.

On Firefox open all browsing history, select your site, right click and choose "Forget about this site".
