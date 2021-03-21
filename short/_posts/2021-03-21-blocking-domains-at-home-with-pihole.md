---
layout: post
title: Blocking domains at home with Pi-hole
---

I've had the [raspberry-pi](https://www.raspberrypi.org/products/) connected to 
the router for a while now. It has a reserved IP address on the local network 
(configurable via a router). Crucially [a service called Pi-hole](https://pi-hole.net/) 
is installed on it.

Every device on the local network is configured to use the custom DNS - with a previously 
mentioned reserved IP address. This way, Pi-hole can filter every DNS lookup and 
block those from responding if they match an entry in a black-list.

The ordinary black-list is excellent, but you want a bit more protection for the kids' devices. 
One thing you can do is to set [the upstream DNS service on Pi-hole](https://docs.pi-hole.net/guides/dns/upstream-dns-providers/) 
to point to one of the "family" DNS, like [1.1.1.3 provided by Cloudflare](https://blog.cloudflare.com/introducing-1-1-1-1-for-families/).
Then add more domains to the black-list. I chose the list from `StevenBlack`'s 
Github account [github.com/StevenBlack/hosts/tree/master/alternates/fakenews-gambling-porn-social](https://github.com/StevenBlack/hosts/tree/master/alternates/fakenews-gambling-porn-social).

