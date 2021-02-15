---
layout: post
title: node.js as serivce with upstart on centos
image: /assets/node_upstart-700x326.png
---

Recently I gave myself simple task to test out tiny _node.js_ app on server. While starting it manually is no brainer but it made me think more when I wanted to make it work as background service.

Usually I do it in `/etc/init.d/` folder by creating _bash_ script and run it from there, it is reliable, it is how _httpd_ starts. But after some googling I found people talking about _upstart_ and _monit_, I did feel like caveman, but took it seriously and opened [upstart cookbook](http://upstart.ubuntu.com/cookbook/) and just started to evaluate how should I eat it and if it is poisonous.

So after some digging I did decide to run _node.js_ with _upstart_ just because its new to me and its philosophy of event driven approach seems close to node. But challenges just began.

_Upstart_ is not supported in all distros, and I was lucky that _centos_ supports it and has version pre-installed, but sadly its `0.6.5` which is away from now latest `1.5`. I could have downloaded latest package and “try” to install it but I thought it is not worth the effort to just try out small node app.

### Single instance

My _upstart_ version is _0.6.5_, so how should I take care of starting _node_ as background service. Well first thing is to specify user for _node_ to run. I did install _node_ from [binary tarball](http://nodejs.org/download/) to `/usr/share/node/node-v0.8.9-linux-x64`, later created `apps` folder in `/usr/share/node` and added sample [express3 app](https://github.com/jaredhanson/passport-local/tree/33d420ba5f54939c85adc5e4b61009db6467a900/examples) from _node_ `passport-local` module examples. Then created user `node` and changed `/usr/share/node` ownership recursively to `node` user with `chown -R node /usr/share/node`.

By default app will not even start as it has some dependencies but those could be handled with _npm_ which comes with _node_ installation by default.

Next step was to start this app as a background service as title of this article says. For a service aka job to be started by _upstart_ it is required to put `*.conf` file into `/etc/init/` directory. In _upstart_ `1.4` and upwards it could be placed into `$home/.init/` but not in my case. _Upstart_ is evented system so basically you react to events on system and do your stuff, you can also emit your own events and catch those in other scripts. So in my case I had to write simple script which listens to some sort of startup event and starts app after it gets one, so after reading docs and googling I came up with [louischatriot’s script found on github](https://gist.github.com/louischatriot/3385102/9de6178ab838a3450fc04204cc244be0e0cab925):

```bash
# /etc/init/node.conf
description 'node system startup'
author 'ivarprudnikov.com'
env NAME=AppName
env LOG_FILE=/usr/share/node/some.log
env USER=node
env NODE_BIN=/usr/share/node/node-v0.8.9-linux-x64/bin/node
env SCRIPT_FILE=/usr/share/node/apps/examples/express3/app.js
start on runlevel [2345] stop on runlevel [016]
# Respawn in case of a crash, with default parameters
respawn
script
  # Make sure logfile exists and can be written by the user we drop privileges to
  touch $LOG_FILE
  chown $USER:$USER $LOG_FILE
  # recommended approach in case of su/sudo usage so that service does not fork
  exec su -s /bin/sh -c 'exec "$0" "$@"' $USER -- $NODE_BIN $SCRIPT_FILE >> $LOG_FILE 2>&1
end script
post-start script
echo "app $NAME post-start event" >> $LOG_FILE
end script
```

After saving file it is possible just to run it with `initctl start node` and app should be started.

But after restart I did not see it running, so what was wrong?? I found answer on [serverfault](http://serverfault.com/questions/291546/centos-6-and-upstart) and debug file to test out events fired in the system:

```bash
# /etc/init/debug.conf
start on ( starting JOB!=debug \
or started JOB!=debug \
or stopping JOB!=debug \
or stopped JOB!=debug )
script
exec 1>>/tmp/log.file
echo -n "$UPSTART_JOB/$UPSTART_INSTANCE ($0):$$:`date`:"
echo "Job $JOB/$INSTANCE $UPSTART_EVENTS. Environment was:"
env
echo
end scripts
```

So now after looking into `/tmp/log.file` I could choose which event to listen to and start _node_ app. I changed:

```bash
start on runlevel [2345]
stop on runlevel [016]
```

to

```bash
start on started network
stop on stopping network
```

So now app is running in background, restarts in case of failure, starts on startup. Things to consider are hooking to events which are important to _node_, it would be possible to have `nginx` set up in this way and then:

```bash
start on ( started network and started nginx )
```

### Useful links

- [http://upstart.ubuntu.com/cookbook](http://upstart.ubuntu.com/cookbook)
- [http://superuser.com/questions/213416/running-upstart-jobs-as-unprivileged-users](http://superuser.com/questions/213416/running-upstart-jobs-as-unprivileged-users)
- [http://josesantiagojr.com/post/29633984407/deploying-node-js-with-upstart-and-monit](http://josesantiagojr.com/post/29633984407/deploying-node-js-with-upstart-and-monit)
- [https://gist.github.com/3385102/9de6178ab838a3450fc04204cc244be0e0cab925](https://gist.github.com/3385102/9de6178ab838a3450fc04204cc244be0e0cab925)
- [http://clock.co.uk/tech-blogs/upstart-and-nodejs](https://web.archive.org/web/20160630163901/http://www.clock.co.uk:80/blog/upstart-and-nodejs)
- [http://clock.co.uk/tech-blogs/deploying-nodejs-apps](https://web.archive.org/web/20160620120111/http://www.clock.co.uk:80/blog/deploying-nodejs-apps)
