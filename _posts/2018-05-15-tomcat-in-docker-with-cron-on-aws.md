---
layout: post
title: "Dockerized tomcat and cron on AWS"
image: /assets/tomcat-docker-aws.png
image_caption: "AWS, Docker, Tomcat logos"
---

Long time ago there was an app built using great framework called [Grails](https://grails.org/), it was a monolith rendering its html pages, exposing API for its children [Android](https://www.android.com/) and [iOS](https://www.apple.com/ios), sending stats over to [BigQuery](https://cloud.google.com/bigquery/), and more. It was living inside a privately hosted environment on a [Apache Tomcat](http://tomcat.apache.org/) along with several other web apps as well.

Couple of years passed and now apps are being migrated over to [AWS Elasticbeanstalk](https://aws.amazon.com/elasticbeanstalk/). Replication of environment, we had in datacenter, is a bit tricky in _AWS_, but using the right tools — possible.

### Docker and multiple processes

It is not uncommon to have some unique configuration/scripts inside private host but (leaving the fact why they got there) it is possibly the most frustrating part one needs to deal with when migrating application from one place to the other.

When building [Docker](https://www.docker.com/) container it is usually expected that only one process will run in it and if you need more then just create more docker containers and orchestrate them with [Docker Compose](https://github.com/docker/compose) or similar. But sometimes you want/need to run more than one process in a container.

> It is generally recommended that you separate areas of concern by using one service per container. That service may fork into multiple processes <…>. It’s ok to have multiple processes, but to get the most benefit out of Docker, avoid one container being responsible for multiple aspects of your overall application.

Above quote comes from *Docker* docs “[Run multiple services in a container](https://docs.docker.com/config/containers/multi-service_container/)” which also shows example usage of process manager [supervisord](http://supervisord.org/) to run multiple processes in a container.

My specific use case requires _Tomcat_ and _Cron_ to be run on the same container, here is a starter [Dockerfile](https://docs.docker.com/engine/reference/builder/) and it is based on [official tomcat image](https://github.com/docker-library/tomcat) which itself is based on [openjdk](https://hub.docker.com/_/openjdk/) one:

```dockerfile
FROM tomcat:7-jre7
# ^^^ set base image

# set base directory to be used in other instructions
WORKDIR ${CATALINA_HOME}

# Install dependencies
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get -y update && apt-get install -y build-essential curl zip unzip cron software-properties-common supervisor

# Copy Supervisor config
RUN mkdir -p /var/log/supervisor
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Copy WAR to Tomcat
RUN rm -rf -- webapps/*
COPY ./ROOT.war webapps/

# Add cron task
COPY crontab.txt .
RUN touch logs/cron.log
RUN /usr/bin/crontab crontab.txt

# expose tomcats' port
EXPOSE 8080

# Start main process
CMD ["/usr/bin/supervisord"]
```

For above *Dockerfile* to work we need to provide *ROOT.war* file (which will be deployed to *Tomcat)*, *crontab* config and *supervisor* config which spawns *tomcat* and *cron* processes.

```
# crontab config
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
* * * * * echo "foobar every second"
```

*Supervisor* should run as main process thus not daemonize, I do also keep logs in one directory, it will help later when reading logs in *AWS*.

```bash
# supervisor config

[supervisord]
nodaemon=true
loglevel=debug
logfile=/usr/local/tomcat/logs/supervisor.log
logfile_maxbytes=1GB
childlogdir=/usr/local/tomcat/logs/

[program:catalina]
autostart=true
startretries=3
startsecs=60
command=catalina.sh run

[program:cron]
startretries=3
autostart=true
command=cron -f -L 4
```

### Dealing with failing subprocesses

One caveat here is a state [FATAL](http://supervisord.org/subprocess.html#process-states) of a subprocess which might occur after too many retries (e.g. *Tomcat* cannot start), you might expect that whole supervisor will fail in such case but instead nothing happens, we need to make sure supervisor makes proper suicide in this scenario.

I’ve added custom event listener to supervisor config, it listens for any fatal events and terminates whole supervisor if FATAL state was observed:

```bash
# <...>

[eventlistener:exit_on_any_fatal]
command=exit-event-listener
# http://supervisord.org/events.html#process-state-fatal-event-type
events=PROCESS_STATE_FATAL
```

Above event listener needs an executable program called exit-event-listener to be available in the path, it will run suicide logic:

```python
#!/usr/bin/env python
import os
import signal

from supervisor import childutils


def main():
    while True:
        headers, payload = childutils.listener.wait()
        childutils.listener.ok()
        if headers['eventname'] != 'PROCESS_STATE_FATAL':
            continue
        os.kill(os.getppid(), signal.SIGTERM)


if __name__ == "__main__":
    main()
```

Now extend *Dockerfile* to make sure exit-event-listener is copied over to container:

```dockerfile
COPY exit-event-listener /usr/local/bin/
```

### Building and verifying if processes work as expected

Up to this point we have the following files in a directory:

* Dockerfile
* ROOT.war
* crontab.txt
* exit-event-listener
* supervisord.conf

Make sure *Docker* is installed and then build image based on our *Dockerfile*:

```bash
$ docker build -t somename .
```

After we need to start this built image:

```bash
$ docker run --rm -it -p 8080:8080 somename
```

Provided that everything is all right and container is running it is necessary to get inside of it to perform checks:

* `$ docker ps` - find docker CONTAINER ID and use it in next command (replace $id)
* `$ docker exec -it $id bash` - ssh into docker container
* `root@$id:/usr/local/tomcat# top` - should show all processes, there should be: `supervisord`, `java`, `cron`, `python`
* `root@$id:/usr/local/tomcat# supervisorctl` - states of processes under supervisor, all of them should be `RUNNING` : `exit_on_any_fatal`, `catalina`, `cron`
* `supervisor> exit` - exit the `supervisor`
* `root@$id:/usr/local/tomcat# crontab -l` - list cron jobs, should contain contents from `crontab.txt`
* `root@$id:/usr/local/tomcat# wc -l logs/cron.log` - check how many lines log contains, it should increase every minute.

### Preparing to deploy to AWS Elasticbeanstalk

*Elasticbeanstalk* supports *Docker* containers but there are couple more hops you need to make to deploy them in your environment. Firstly you need [Dockerrun.aws.json](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/create_deploy_docker_image.html) configuration file:

```json
{  
  "AWSEBDockerrunVersion": 1,
  "Logging": "/usr/local/tomcat/logs",
  "Volumes": []
}
```

I am using *Single Container Docker Configuration* which is defined by AWSEBDockerrunVersion value being 1 , default log file directory is also being set (I’ve mentioned above that aggregating logs in one directory will help). Also there is no need to map folders from host to Docker container thus Volumes array is empty.

The last part is to zip everything:

```bash
zip Docker.zip -r *
```

Above command with produce Docker.zip file which can be uploaded directly to AWS or by using one of its clients.

### Source code

Sources can be found in my github repo:
[ivarprudnikov/dokerized-tomcat-and-cron](https://github.com/ivarprudnikov/dokerized-tomcat-and-cron)
