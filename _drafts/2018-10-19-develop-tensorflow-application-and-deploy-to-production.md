---
layout: post
title: Wrap Tensorflow scripts in Docker and deploy to AWS
toc: true
---

Machine and deep learning tooling is excitingly accessible and fun for a developer to work with. There are couple of ways to develop/play with machine learning code:

- _Jupyter notebook_ running locally or on your server
- _Jupyter_ environment/scripting in the cloud:
	- [_Kaggle_](https://www.kaggle.com/kernels)
	- [_Google Colab_](http://colab.research.google.com)
	- [_Floydhub_](https://www.floydhub.com/)
	- [_SageMaker_](https://aws.amazon.com/sagemaker/)
- Scripting/developing locally

There might be more options I am unaware of or more likely I just cannot find them using simple search engine queries.

I tried couple of those above - _Jupyter notebook_, scripting locally and _Kaggle_. The approach you take usually depends on what you want to achieve. If you want to learn then starting with the cloud solution is the shortest way which gives the most pleasure, picking _Kaggle_ could probably be one of the best choices, you can see what others do and can fork their _kernels_ and learn by example.

Whilst playing/learning with machine learning is undeniably a great way to spend your time, it is a bit more exciting to use the skills and build a production ready model for others to consume. For this choice now I pick scripting - writing _Python_ scripts which are later deployed to production and exposed via browser interface.

**Note:** if you prefer looking into code then check out an implementation supporting this article in [Github repo ivarprudnikov/char-rnn-tensorflow](https://github.com/ivarprudnikov/char-rnn-tensorflow)

## Objectives

- Prepare _Python_ scripts for training & generating
- Store training data & training parameters
- Train models in browser interface
- Generate text based on previously trained model
- Wrap implementation in _Docker_
- Use _CI_ service to build _Docker_ image for the registry
- Run _Docker_ image on _AWS_ and expose it to the _WWW_

## Text generator

As it happens there are examples of simple text generators in the web. One of them leads me to a character generator detailed in Andrei Karpathy's blog post ["The Unreasonable Effectiveness of Recurrent Neural Networks (RNN)"](http://karpathy.github.io/2015/05/21/rnn-effectiveness/) published in mid 2015. This RNN example relieves me from any explanations how/why it works and is generally concise in its implementation.

Part of the problem is solved but current article mentions [Tensorflow](https://www.tensorflow.org/) and [Karpathy's implementation](https://github.com/karpathy/char-rnn) is written in [Torch](http://torch.ch/). For this reason there was a reimplementation of `char-rnn` I found in another _Github_ repository [hzy46/Char-RNN-TensorFlow](https://github.com/hzy46/Char-RNN-TensorFlow) which I [forked and tweaked](https://github.com/ivarprudnikov/char-rnn-tensorflow) a bit.

### Training

Happily `char-rnn-tensorflow` is capable of training the model by passing it a text file as an argument amongst other possible options.

```bash
python train.py \
  --input_file data/shakespeare.txt  \
  --name shakespeare \
  --num_steps 50 \
  --num_seqs 32 \
  --learning_rate 0.01 \
  --max_steps 20000
```

Above will produce and save couple of [Tensoflow checkpoints](https://www.tensorflow.org/guide/checkpoints) but will take some time. Training time varies depending on hardware you have at disposal. Lengthy training process forces us to use asynchronous API when exposing this feature via _HTTP_ so that user gets notified after s/he submits request to train on given data and process finishes in the background.

### Generating text

After training completes and checkpoints were saved we can call another script to generate text for us:

```bash
python sample.py \
  --converter_path model/shakespeare/converter.pkl \
  --checkpoint_path model/shakespeare/ \
  --max_length 1000
```

Above script needs a path to checkpoint data to pull variable values from it and use in the rebuilt model, it also uses the vocabulary file which was dumped in the process of training, that includes characters used for text generation.

## Web application

Given we have `python` scripts for training and character generation it is possible to wrap those in a simple _app_ exposed to the public internet. User will be able to upload and train her own sample then generate some text after training finishes.

To build an app I'll use _Node.js_ with _Express_ framework. There will be couple of publicly accessible paths to deal with uploading of training data, training of that data and generating text out of it. User will also be able to see other submissions as we do not care about security and accounts to make this exercise simpler.

### Uploading data

Simplest approach to solving the upload problem is a basic html form. User should have UTF-8 encoded plain text file available on her system. And app should be able to render the form and process form _POST_ with `multipart/form-data`. Ideally uploaded plain text files could be stored somewhere on _AWS S3_ or similar services to leverage almost infinite scalability but for this exercise I'll keep those on the same server running application and executing Python scripts.

**Render upload form**

Basic knowledge of Express framework here is assumed. Below example expects view engine along with default views directory set to be able to render `html`. If you follow code in [git repository](https://github.com/ivarprudnikov/char-rnn-tensorflow) it will be a bit different and will have more _features_ used. 

```javascript
router.get('/upload', (req, res) => {
  // render upload.html/upload.ejs file
  res.render('upload')
})
```

```html
<!-- excerpt from upload html/ejs file -->
<form action="/upload" method="post" enctype="multipart/form-data">
  <fieldset>
    <legend>Training data</legend>
      <label for="customFile">Choose training data file</label>
      <input name="file" type="file" id="customFile" required>
      <small class="form-text text-muted">
        File should be UTF-8 plain/text containing data you want to use for training.
      </small>
  </fieldset>
  <button type="submit">Upload</button>
</form>
```

**Process form POST**

In order to process multipart form request I chose to use _Busboy_ dependency.

```bash
$ npm i -S busboy
```

Original filename is not being used and instead is replaced with `train.txt` which is going to be the same for every upload. In order to distinguish those files they will be living in separate directories named after generated id which is a timestamp here in the example. After successful upload user will be redirected.

```javascript
router.post('/upload', (req, res) => {

  // generate id
  const id = Date.now()
  
  // prepare dependency used to process request
  const busboy = new Busboy({
    headers: req.headers,
    limits: {
      fileSize: 1024 * 50, // bytes
      files: 1 // only one file per request
    }
  })
  let fileStream = null
  let filePath = null
  let folderPath = path.join('uploads', id)

  // handle multipart file
  busboy.on('file', (fieldName, file, fileName) => {
    if (fileName) {
      fs.mkdirSync(folderPath)
      filePath = path.join(folderPath, 'train.txt')
      fileStream = file.pipe(fs.createWriteStream(filePath))
    }
  });
  
  // redirect on success, otherwise render same page with error message
  busboy.on('finish', () => {
    res.set({Connection: 'close'});

    if (!fileStream) {
      res.render('upload', Object.assign(res.locals, {
        error: "Cannot save given training data"
      }));
    } else {
      fileStream.on('finish', async () => {
        res.redirect('/')
      })
      fileStream.on('error', () => {
        res.render('upload', Object.assign(res.locals, {
          error: "Error occurred while saving file"
        }));
      })
    }
  })
  
  // pipe request stream to our dependency
  req.pipe(busboy)
})
```

One problem is _almost_ solved, training file is ready to be used.

### Storage

We could store everything in the filesystem but eventually it gets quite complicated. Initially I thought example without database will be a bit more readable but the effect was opposite as soon as I wanted to render more details in html having not just generated ids. It is useful to track when user uploads data, when training starts and ends, even giving names to those training jobs is useful.

Apart from those mentioned useful parts it will be necessary to store logs as well. Logs are going to be produced when training on uploaded data. I chose to store those in database after reading quite old _Travis_ blog post [add link] about how they process logging.

#### Model

There are 2 thigs I want to store:

- `model` represents training job and contains details such as `id`, time it was created, training parameters, if user uploaded text data, is training complete, etc.
- `log` is part of model but instead of having one big field containing all the text it will be split into lines which will make it easier to insert new data.

#### Database

Now that there is a relationship between models and structure is known in advance - will not likely to change, it is sensible to choose relational database. I believe that lowest common denominator will be _MySQL_. Document store such as _Mongo_ does not really make much sense here and not only because of relationship but more due to the nature of log data which will drip line by line.

```sql
create table model (
  id             varchar(255) not null,
  created_at     timestamp             DEFAULT CURRENT_TIMESTAMP,
  updated_at     timestamp             DEFAULT CURRENT_TIMESTAMP
  ON UPDATE CURRENT_TIMESTAMP,
  name           varchar(255) not null,
  train_params   json         not null,
  has_data       tinyint      not null default false,
  is_in_progress tinyint      not null default false,
  is_complete    tinyint      not null default false,
  training_pid   varchar(255),
  primary key (id)
)
  ENGINE = InnoDB
  DEFAULT CHARACTER SET utf8
  COLLATE utf8_general_ci;

alter table model
  add constraint unique_id unique (id);
alter table model
  add constraint unique_pid unique (training_pid);

create table model_log (
  model_id varchar(255) not null,
  position int          not null,
  chunk    text         not null
)
  ENGINE = InnoDB
  DEFAULT CHARACTER SET utf8
  COLLATE utf8_general_ci;
alter table model_log
  add index FK_MODEL_LOG_MODEL (model_id),
  add constraint FK_MODEL_LOG_MODEL foreign key (model_id) references model (id);
```

A quite _simple_ schema encapsulates what I mentioned before, table `model` will contain metadata about training and `model_log` will contain chunks of log text. Position in `model_log` ins necessary in theory to guarantee order of log entries.

In order for _Node.js_ to connect to database we'll need to get relevant dependency:

```bash
$ npm i -S mysql
```

To verify that connection works we could try listing models:

```javascript
const mysql = require('mysql')
const pool = mysql.createPool({
  connectionLimit: 10,
  connectTimeout: 20 * 1000,
  acquireTimeout: 20 * 1000,
  timeout: 10 * 1000,
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'rnn_generator',
  port: process.env.MYSQL_PORT || 3306,
  // ssl: "Amazon RDS", will be necessary later
})

pool.query("select * from model order by updated_at desc limit ? offset ?", [10, 0], (error, rows) => {
  console.log(rows)
})
```

### Training parameters

Just before being able to run those scripts we need to pass some arguments to them as well. Before that user ought to be able to tweak them in _UI_. Arguments are going to be exposed as a web form to the user and upon _POST_ those values will be stored in the database. You can see [all of training options used in a web form in the git repository](https://github.com/ivarprudnikov/char-rnn-tensorflow/blob/master/server/views/training_options.ejs). As an example a form looks similar to the following:

```html
<form action="/<%= locals.model.id %>/options" method="post" enctype="multipart/form-data">

  <h1 class="h3 text-center mb-3">Update training options</h1>

  <% if(locals.errors){ %>
    <p class="alert alert-warning">
      Form contains errors
    </p>
  <% } %>

  <fieldset>
    <legend>Training options</legend>

    <div class="form-group row">
      <label for="num_seqs" class="col-sm-6 col-form-label">Number of seqs in one batch</label>
      <div class="col-sm-6">
        <input name="num_seqs" placeholder="Default: 32" type="number" id="num_seqs"
               class="form-control <% if(fieldErr("num_seqs")){ %>is-invalid<% } %>"
               min="1"
               value="<%=fieldData("num_seqs")%>">
        <% if(fieldErr("num_seqs")){ %>
        <div class="invalid-feedback"><%= fieldErr("num_seqs") %></div>
        <% } %>
      </div>
    </div>
    
    <!-- More fields in Github repository -->
    
    <hr class="mt-5">
    
    <div class="text-right">
      <a href="/model/<%= locals.model.id %>" class="btn btn-outline-secondary">Cancel</a>
      <button type="submit" class="btn btn-primary">Update</button>
    </div>
  </fieldset>
</form>
```

Above you can see I am using variable interpolation `<%= variable %>` which is part of [`ejs` templating engine](https://ejs.co/) I have configured _Express_ app with. This form expects `model` to be passed to renderer, the one returned from _MySQL_ and `data` which holds form field values, it also expects helper functions `fieldData()` which is a shorcut to access values in `data` object and `fieldErr()` which checks if there is an error for a given form field. Rendering of the above looks like:

```javascript
router.get('/:id/options', checkPathParamSet("id"), loadInstanceById(), (req, res) => {
  res.render('training_options', Object.assign(res.locals, {
    data: JSON.parse(req.instance.train_params),
    model: req.instance
  }))
})
```

Here `checkPathParamSet` and `loadInstanceById` are helper middleware functions that are reused amongst other methods as well:

```javascript
function checkPathParamSet(paramName) {
  return (req, res, next) => {
    if (!req.params[paramName]) {
      res.render('404')
      return
    }
    next()
  }
}

function loadInstanceById() {
  return async (req, res, next) => {
    let instance = await db.findModel(req.params.id)
    if (!instance) {
      res.render('404')
    } else {
      req.instance = instance;
      next()
    }
  }
}
```

#### Schema validation

Storage of training parameters is pretty much straightforward except their validation. To make sure we comply with _Python_ script api those requirements need to be formalized somewhere else but script itself and then validated against before storage. This could also be an _ad hoc_ implementation but validation ought to be reused before calling script as well, also reading code is harder that looking into schema. I am using JSON schema for parameter definition and validation, below example shows only couple of fields:

```json
{
  "$id": "generator/schema/training/options.json",
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "num_seqs": {
      "type": "integer",
      "minimum": 1,
      "description": "number of seqs in one batch"
    },
    "num_steps": {
      "type": "integer",
      "minimum": 1,
      "description": "length of one seq"
    }
  },
  "additionalProperties": false
}
```

There are couple of JSON schema validators in the wild but I chose [`ajv`](https://github.com/epoberezkin/ajv) as it supports latest schema drafts. Lets see how validation logic is implemented:

```javascript
const Ajv = require('ajv')
// above schema sample
const trainOptionsSchema = require("train_arguments_schema.json") 
const ajv = new Ajv({allErrors: true, coerceTypes: true, removeAdditional: true})
const validator = ajv.compile(trainOptionsSchema)

/**
 * @param params {object}
 * @return {object} Errors if any
 */
function chackTrainParams(params) {
  if (validator(params)) {
    return null
  }
  let errors = {}
  // validator shows path of failing leaf starting with a dot
  // changing it to simplify rendering of error messages
  validator.errors.forEach((err) => {
    let keyWithoutTrailingDot = err.dataPath.replace(/^\./, "");
    errors[keyWithoutTrailingDot] = err.message
  })
  return errors
}
```

With above implementation it is easy enough to check if there are any errors in current object:

```javascript
chackTrainParams({num_seqs: 0})

// returns
// { num_seqs: 'should be >= 1' }
```

#### Storage

Previously for document upload I used `Busboy` but when using it with form fields it is a bit verbose, gladly there is a wrapper around that dependency called [`multer`](https://github.com/expressjs/multer#readme) which puts form fields into `req.body`. For just the form field submissions use `multerUpload.none()` middleware.

```js
router.post('/:id/options', checkPathParamSet("id"), loadInstanceById(), multerUpload.none(), asyncErrHandler.bind(null, async (req, res) => {

  let model = req.instance

  // filter out empty values
  let params = Object.keys(req.body).reduce((memo, val) => {
    if (req.body[val] != null && req.body[val] !== "") {
      memo[val] = req.body[val]
    }
    return memo
  }, {})

  let errors = chackTrainParams(params)
  if (errors) {
    return res.render('training_options', Object.assign(res.locals, {
      error: "Found " + Object.keys(errors).length + " errors",
      errors: errors,
      data: params,
      model: req.instance
    }))
  }

  await db.updateModel(model.id, {
    train_params: JSON.stringify(params)
  })

  res.redirect(`${req.baseUrl}/${model.id}`)
}))
```

Another thing above is `async` error handler which ought to be explicitly written as until now _Express_ does not allow handling them:

```javascript
const asyncErrHandler = (asyncFn, req, res) => asyncFn(req, res)
  .catch(err => {
    console.log((new Date()).toISOString(), "[ERROR]", util.inspect(err))
    res.status(500).render('500')
  });
```

### Running python scripts

All ingredients are ready to be used, training data will be uploaded to a location on disk, training parameters will be stored in a database. It is now necessary to use those details and run _Python_ scripts which were forked already. I've written about how to run _Python_ scripts from within _Node.js_ application already so will not delve into much details, make sure to skim it through though ["Using Python scripts in Node.js server"]({{ site.baseurl }}{% post_url 2018-11-11-nodejs-server-running-python-scripts %}).

**Action buttons**

First I need action buttons in UI which will start/stop training process, upon click those should hit appropriate path handler in application which will do the rest. Those buttons will be exposed only in certain conditions - start when training data is uploaded and stop only when training is in progress:

```html
<% if(model.is_in_progress){ %>
  <form class="d-inline-block" action="/model/<%= model.id %>/stop" method="post">
    <button type="submit" class="btn btn-sm btn-danger">Stop training</button>
  </form>
<% } else if (model.has_data) { %>
  <form class="d-inline-block" action="/model/<%= model.id %>/start" method="post">
    <button type="submit" class="btn btn-sm btn-outline-primary">Start training</button>
  </form>
<% } %>
```

**Start training**

Before executing training script we need to be sure it is not running currently, this is achieved by checking if `training_pid` is present on `model` instance. It is also necessary to clean up any existing log entries if those exist because relationship prohibits having more than one log representation for training, in other words - one model one log. Then script will be started in a separate process and events coming from it will be both stored in the database and sent to websocket connection to be rendered in real time.

```javascript
routerModel.post('/:id/start', checkPathParamSet("id"), loadInstanceById(), asyncErrHandler.bind(null, async (req, res) => {

  let model = req.instance
  
  // if in progress then cancel
  if (model.training_pid) {
    return res.redirect(`${req.baseUrl}/${model.id}`)
  }

  const params = JSON.parse(model.train_params || "{}")
  
  // clear any existing logging
  await db.deleteLogEntries(model.id)

  // launch script process
  let subprocess
  try {
    subprocess = await trainModel(model.id, params)
  } catch (err) {
    // cleanup if error
    await db.setModelTrainingStopped(model.id)
    return res.render('show', Object.assign(res.locals, {
      model: req.instance,
      error: util.inspect(err)
    }))
  }

  // obtain a running websocket instance
  const wss = req.app.get(WEBSOCKET)

  // store logs and also spit it out to websocket ro render them in real time
  let chunkPosition = 1
  subprocess.stdout.on('data', async (data) => {
    let logEntry = {
      model_id: model.id,
      chunk: data + "",
      position: chunkPosition
    }
    await db.insertLogEntry(logEntry)
    wss.broadcast(JSON.stringify(logEntry))
    chunkPosition++
  });
  subprocess.stderr.on('data', async (data) => {
    let logEntry = {
      model_id: model.id,
      chunk: `Error: ${data}`,
      position: chunkPosition
    }
    await db.insertLogEntry(logEntry)
    wss.broadcast(JSON.stringify(logEntry))
    chunkPosition++
  });

  // mark model as in progress
  await db.setModelTrainingStarted(model.id, subprocess.pid);

  // get back to page it was initiated on
  res.redirect(`${req.baseUrl}/${model.id}`)
}))
```

## Deployment to AWS

### Docker

### Travis CI

### Elastic beanstalk

## Source code
