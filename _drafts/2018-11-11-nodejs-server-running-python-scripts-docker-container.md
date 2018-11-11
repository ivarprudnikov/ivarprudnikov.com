---
layout: post
title: Exposing Python scripts via Node.js server
---

A while back ago I was learning/playing with machine/deep learning but all that was only in _Python_, in a _Jupyter Notebook_. Latter allows writing and running and executing scripts in a browser window. Unfortunately I was not aware of any obvious way to easily reuse those scripts in a webapp. So I decided to write an example of how would it look like to be able to call _Python_ scripts from withing a running server application, hence this article.

There was [an attempt](https://github.com/ivarprudnikov/facial-keypoints) to use _Python_ alone for both the server and scripting, unfortunately it failed, most likely due to the fact that I am mostly _Javascript_ / _Java_ programmer these days. [Writing webapp](https://github.com/ivarprudnikov/facial-keypoints/tree/master/app) with _Flask_, which is one of the popular choices among _Python_ developers, was a tedious experience for me compared to development process with _Express_(_Node.js_) or _Spring Boot_(_Java_). I still managed to [wrap that half finished _attempt_ in _Docker_](https://github.com/ivarprudnikov/facial-keypoints/blob/master/Dockerfile) and deploy to _AWS_ though.

Another more elaborate and a bit more successful implementation of this idea using _Node.js_ can be found in _Github_ repository [ivarprudnikov/char-rnn-tensorflow](https://github.com/ivarprudnikov/char-rnn-tensorflow). It uses a _Python_ script which is an implementation of _Recurrent Neural Network (RNN)_ character generator written in _Tensorflow_ framework.

## Python script

For the purpose of my example I will use a simple _Python_ script which outputs messages to standard output along the way:

```python
#!/usr/bin/python
import sys, getopt, time

def main(argv):
    argument = ''
    usage = 'usage: script.py -f <sometext>'
    try:
        opts, args = getopt.getopt(argv,"hf:",["foo="])
    except getopt.GetoptError:
        print(usage)
        sys.exit(2)
    for opt, arg in opts:
        if opt == '-h':
            print(usage)
            sys.exit()
        elif opt in ("-f", "--foo"):
            argument = arg

    print("Start : %s" % time.ctime())
    time.sleep( 5 )
    print('Foo is')
    time.sleep( 5 )
    print(argument)
    print("End : %s" % time.ctime())

if __name__ == "__main__":
    main(sys.argv[1:])
```

Above script will not execute immediately which makes it necessary to hold on to the process and read from its output until it finishes. We could not use it sequentially in a webapp as this might take too long to execute.

## Node server


