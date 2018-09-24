---
layout: post
title: "ROS: from scratch to first package"
image: /assets/ubuntu-terminal-window.png
image_caption: "Ubuntu terminal window"
---

I started using *[Robot Operating System (ROS)](http://www.ros.org/about-ros/)* for my [fresh robot idea](http://dasmicrobot.com) and found first steps of setting up, distribution, version control a bit frustrating. Following text is meant for beginners.

My recent workings circle around web applications, I am used to *[GIT](https://git-scm.com/)* + *[Github](https://github.com/)*, automated testing, builds on *[Travis CI](https://travis-ci.org/)*, package management tools, containers, etc. You take a lot of everyday application development services for granted these days so moving to *ROS* and making something production ready will require a bit of patience.

### The requirements

In my case I am building autonomous system that is going to be made of components (clusters of sensors and actuators) that have their own OS and communicate with each other over *TCP/IP*. *ROS* allows me to distribute system in this way because of its own architecture which has *[pub/sub](https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern)* pattern and where horizontal scalability is achieved by having *master/slave* type nodes; master here acts as a hash table which allows one node to see where others are. This allows to have robot distributed on different pieces running *ROS* with one limitation that those have to be on the same network (as far as I know).

*ROS* itself is a collection of packages that are installed on top of *GNU/Linux*, so underlying hardware has to support it ([other platforms are experimental](http://wiki.ros.org/kinetic/Installation)). To make prototype cheap I’ll start by using *[Raspberry PI](https://www.raspberrypi.org/)* with *[Ubuntu Mate](https://ubuntu-mate.org/)* and will connect it to [differential drive](https://en.wikipedia.org/wiki/Differential_wheeled_robot) and navigation sensors.

### Installation

Provided that you have *GNU/Linux* installed it is relatively easy to add *ROS* on top of it, just follow [installation instructions](http://wiki.ros.org/kinetic/Installation/Ubuntu). First thing here is the fact that you need to install operating system, then *ROS*, which is not fun and consumes time when you are dealing with anything but your personal computer. It is much easier to have backup images of *ROS* ready to be put to SD cards. To save myself some time I have created couple of those, gzipped and put them on [S3 bucket](http://storage.dasmicrobot.com/); those backups have OS installed and accessible via ssh (username: *pi*, password: *raspberry*), more documentation on how to put/backup these images to SD card can be found on [mini docs page](https://github.com/Dasmicrobot/docs).

Other way of using *ROS* can be with *[Docker image](https://hub.docker.com/_/ros/)* although at the time of writing they did not have images for ARM chips which *Raspberry* is. It could be possible to fork those from *ROS* repo and replace base image with something like [armv7/armhf-ubuntu](https://hub.docker.com/r/armv7/armhf-ubuntu/). On the one hand using *Docker* feels like an overhead because SD card could already contain an image with *ROS* preinstalled, on the other hand *Docker* image could be run on your development machine or in a test environment, you could have reproducible environment and could even run multiple *Docker* images representing distributed *ROS* architecture.

For now I will stick with SD cards that have *ROS* pre-installed but will need to use it later when system has multiple *ROS* instances running.

### Development environment

I am writing my code on *OSX* so to be as close as it can be to *Ubuntu/ROS* on *Raspberry PI*. *[VirtualBox](https://www.virtualbox.org/)* is a great candidate for this task, it is possible to virtualize *Ubuntu Mate* on it and to [install *ROS*](http://wiki.ros.org/kinetic/Installation/Ubuntu); the only caveat is that I am not going to have *ARM* environment and will develop on *x86* instead. But even if your development machine is running *GNU/Linux* already it still better to have clean environment like the one with *VirtualBox*, without the pollution of existing libraries and different software versions.

To make sure your new *ROS* [workspace](http://wiki.ros.org/catkin/workspaces) is not going to be destroyed along with *VirtualBox* images you need to create shared folder on your development machine which is going to be accessible by *VBox* image. In my case I created a folder:

```bash
$ mkdir -p ~/Documents/linux_workspace
```

Then added this folder to *VBox* shared folders list in image settings, then installed *Guest Additions* and added *Ubuntu* user to a new *vboxsf* security group, details can be found in [*howtogeek* article](http://www.howtogeek.com/187703/how-to-access-folders-on-your-host-machine-from-an-ubuntu-virtual-machine-in-virtualbox/).

Provided we are in *Ubuntu*, there are couple of [*ROS* IDEs](http://wiki.ros.org/IDEs) which can simplify development. Because of simplicity I chose *[RoboWare Studio](http://www.roboware.me/)* which was downloaded and installed as *.deb* package.

### Workspace

*ROS* needs your code to be in what is called a *[workspace](http://wiki.ros.org/catkin/workspaces)*

> A [catkin workspace](http://wiki.ros.org/catkin/workspaces#Catkin_Workspaces) is a folder where you modify, build, and install catkin packages

To understand more about what actually is a catkin workspace I highly recommend reading *[A Gentle Introduction to Catkin](http://jbohren.com/articles/gentle-catkin-intro).*

After you setup this workspace:
```bash
$ mkdir -p ~/catkin_workspace/src
$ cd ~/catkin_workspace
$ catkin_init_workspace
```

You can then start creating your first *package* which will contain code related to one particular task. As a good example I will give a task to create a *ROS* package which reads sensor data and exposes it via *topic* so that other packages could subscribe to it and get the data.

### Package

After initialization of workspace I was left with new boilerplate CMakeLists.txt file within workspace directory:
```bash
$ ls
CMakeLists.txt src
```

But as far as I understand and by looking into actual examples on *Github* and reading documentation, you should start your new package within *src* directory, *src* means *source space*:

> The [source space](http://wiki.ros.org/catkin/workspaces#Source_Space) contains the source code of catkin packages.
```bash
$ cd src
$ catkin_create_pkg my_sensor_package std_msgs rospy
```

At this point it will create *package.xml* and a *CMakeLists.txt* along with empty src directory within *my_sensor_package*:
```bash
$ ls
my_sensor_package
$ cd my_sensor_package
$ ls
CMakeLists.txt package.xml src
```

I could have created these myself but then would need to make sure *CMakeLists.txt* file contents represent my_sensor_package, eg:
```bash
> *CMakeLists.txt*

cmake_minimum_required (VERSION 2.8.3)
project(my_sensor_package)
find_package(catkin REQUIRED COMPONENTS
  rospy
  std_msgs
)
catkin_package()
include_directories(
  ${catkin_INCLUDE_DIRS}
)
```

Detailed instruction on how to create package are on [*ROS* tutorial page](http://wiki.ros.org/ROS/Tutorials/CreatingPackage).

### Node

After package directories are set, it is time to write our first executable *node* which will read data from sensor and will log it to a customizable *topic*.
```bash
$ mkdir ultrasound
$ cd ultrasound
$ touch ultrasound.launch
$ touch ultrasound.py
```

Here I have 2 new files, one is *.launch* which wraps and runs the executable *.py* file.

My understanding of .launch files is that it is like a function call, you can pass arguments to it, you can call other launch files from within and it will execute logic that is in your binaries. Detailed information can be found in [http://wiki.ros.org/roslaunch](http://wiki.ros.org/roslaunch)

Executable *.py* file it is quite simple, you have to make sure it does not die and by using *rospy* package need to push your data to some *topic.*

### Reading and publishing data

I have a simple ultrasound sensor and need to read the distance it identifies and then pass that value over to some *ROS topic*:
```python
> ultrasound.py

#!/usr/bin/env python

import rospy
from std_msgs.msg import String,Float32
import RPi.GPIO as GPIO
<...>

PUBLISH_RATE = 10 # Hz
GPIO_PIN = 0
TOPIC_NAME = ""
<...>

# calculate distance
def measure():
    <...>
    return calculatedValue;

def ultrasound():
    rospy.init_node('ultrasound', anonymous=True)

    # variables from launch file available after initialization
    global PUBLISH_RATE
    PUBLISH_RATE = rospy.get_param('~PUBLISH_RATE', 10)
    global GPIO_PIN
    GPIO_PIN = rospy.get_param('~GPIO_PIN')
    global TOPIC_NAME
    TOPIC_NAME = rospy.get_param('~TOPIC_NAME', 'bot_sensors_ultrasound')

    # where is it going to/ what type is it?
    pub = rospy.Publisher(TOPIC_NAME, Float32, queue_size=10)

    rospy.loginfo(">>> Ultrasound initialized <<<")
    rospy.loginfo("TOPIC_NAME %s" % TOPIC_NAME)

    rate = rospy.Rate(PUBLISH_RATE)
    while not rospy.is_shutdown():
        distance = measure()
        if distance is not None:
            # make available to subscribers
            pub.publish(distance)
        rate.sleep()

if __name__ == '__main__':
    # RPi related
    GPIO.setmode(GPIO.BOARD)
    try:
        ultrasound()
    except rospy.ROSInterruptException:
        pass
    finally:
        GPIO.cleanup()
```

Full example can be seen on [*Github* repo](https://github.com/Dasmicrobot/bot_sensors/blob/master/ultrasound/ultrasound.py).

Previous code has *Raspberry PI* specific implementation and will not run on *x86* system, this is a challenge, it feels like it is easier to develop the code inside *RPi* instead but first lets finish an attempt and do the *launch* file:
```xml
> ultrasound.launch

<launch>
  <node name="ultrasound" pkg="my_sensor_package" type="ultrasound.py" output="screen">
    <param name="GPIO_PIN" type="int" value="7" />
    <param name="PUBLISH_RATE" type="int" value="10" />
    <param name="TOPIC_NAME" type="str" value="my_custom_topic_name" />
  </node>
</launch>
```

Here I define my *node* to use *ultrasound.py* file as executable and pass private arguments to it. Arguments are within definition of *node*, they are called private and need to be retrieved by using **~** in the code.

Do not forget to make *.py* file executable:
```bash
$ chmod +x ultrasound.py
```

You could try and launch it by first running *catkin_make* in your workspace, then *source* newly generated *setup.bash* and finally executing *roslaunch*:
```bash
$ cd ~/catkin_workspace
$ catkin_make
$ source devel/setup.bash
$ roslaunch src/my_sensor_package/ultrasound/ultrasound.launch
```

It will fail because *RPi* package is not installed, even after you install it it will fail and complain that it is not on *Raspberry*.

### Distributing your new package

As it is already obvious this *Python* script is useless on *x86* machine and I need to run it on *Raspberry*. I prefer to use *GIT* to distribute my code so this *ROS package* is no exception, first push it to git repo and then clone it to workspace on *RPi*.
```bash
$ cd ~/catkin_workspace/src/my_sensor_package
<...> add .gitignore
$ git init
$ git add .
$ git commit -m "my first package"
$ git remote add origin ***remote repository URL***
$ git push -u origin master
```

After switch to Raspberry and clone the same code into workspace:
```bash
$ ssh pi@192.168.2.2
password
$ mkdir -p ~/catkin_workspace/src
$ cd ~/catkin_workspace
$ catkin_init_workspace
$ cd src
$ git clone ***remote repository URL***
$ cd my_sensor_package
$ catkin_make
$ source devel/setup.bash
$ roslaunch src/my_sensor_package/ultrasound/ultrasound.launch
```

At this point you have *ROS node* running on *Raspberry PI* (provided you have no error in *.py*)
