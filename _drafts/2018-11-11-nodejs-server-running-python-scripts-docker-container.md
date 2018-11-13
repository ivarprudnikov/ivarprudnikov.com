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

Above script will not execute immediately which makes it necessary to hold on to the process and read from its output until it finishes. We do not want to use it sequentially in a webapp as this might takes quite long time to execute.

## Node server

There are three main problems that need be solving: call Python script, pass script output to client, render output in the client. Lets start with creating simple _Node.js_ program, call it `server.js`, for now it is empty.

### Run python script

One of the accessible commands provided in _Node.js_ API is [`child_process.spawn()`](https://nodejs.org/dist/latest-v10.x/docs/api/child_process.html#child_process_child_process_spawn_command_args_options).

> The child_process.spawn() method spawns a new process using the given command, with command line arguments in args.

So to run above Python script, provided it is called `script.py`, we could add following to out `server.js`:

```javascript
const path = require('path')
const {spawn} = require('child_process')

function runScript(){
  return spawn('python', [
    "-u", 
    path.join(__dirname, 'script.py'),
    "--foo", "some value for foo",
  ]);
}

const subprocess = runScript()

subprocess.stdout.on('data', (data) => {
  console.log(`data:${data}`);
});
subprocess.stderr.on('data', (data) => {
  console.log(`error:${data}`);
});
subprocess.stderr.on('close', () => {
  console.log("Closed");
});
```

In above example the script output is going to come in through `.on('data', callback)`. Also it was necessary to use `-u` flag when running the script to prevent Python from buffering output, otherwise `data` event would not get `print()` statements from script up until the end of execution.

To test if everything works just run it and check the Python script output is visible in the shell.

```bash
$ node server.js
``` 

### Render script output in HTTP response

If you are using _Express_ framework then sending back output would be as easy as:

```javascript
const express = require('express')
const app = express()

// <...>

app.get('/run', function (req, res) {
  const subprocess = runScript()
  res.set('Content-Type', 'text/plain');
  subprocess.stdout.pipe(res)
  subprocess.stderr.pipe(res)
})

app.listen(8080, () => console.log('Server running'))
```

Unfortunately _piping_ everything back to response requires client either to understand that response is chunked or to wait for execution of script to finish before rendering output. Latter is going to happen if you will be consuming endpoint with the likes of `jQuery`:

```javascript
jQuery.get("/run").done(function (data) {
  console.log(data) // rendered after all data was transferred
})
```

### Using WebSocket to render output

To send back script output in chunks, we could use _WebSockets_, this will require _Node.js_ server to accept incoming requests via this protocol and the client to be able to connect to it.

First lets install some dependencies:
```bash
$ npm i -S ws
```

Then expand our previous `server.js` to deal with new _WebSocket_ conections:



