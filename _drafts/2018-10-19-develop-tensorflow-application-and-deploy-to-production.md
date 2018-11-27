---
layout: post
title: Wrap Tensorflow scripts in Docker and deploy to AWS
---

Machine and deep learning tooling is excitingly accessible and fun for a developer to work with. There are couple of ways to develop/play with machine learning code:

- _Jupyter notebook_ running locally or on your server
- _Jupyter_ environment/scripting in the cloud:
	- [_Kaggle_](https://www.kaggle.com/kernels)
	- [_Google Colab_](http://colab.research.google.com)
	- [_Floydhub_](https://www.floydhub.com/)
- Scripting/developing locally

There might be more options I am unaware of or more likely I just cannot find them using simple search engine queries.

I tried couple of those above - _Jupyter notebook_, scripting locally and _Kaggle_. The approach you take usually depends on what you want to achieve. If you want to learn then starting with the cloud solution is the shortest way which gives the most pleasure, picking _Kaggle_ could probably be one of the best choices, you can see what others do and can fork their _kernels_ and learn by example.

Whilst playing/learning with machine learning is undeniably a great way to spend your time, it is a bit more exciting to use the skills and build a production ready model for others to consume. For this choice now I pick scripting - writing _Python_ scripts which are later deployed to production and exposed via _HTTP_ API.

**Note:** if you prefer looking into code then check out an implementation supporting this article in [Github repo ivarprudnikov/char-rnn-tensorflow](https://github.com/ivarprudnikov/char-rnn-tensorflow)

## Objectives

- Prepare text generator which takes training text as an argument
- Store text model variables for later reuse
- Develop API that generates text based on previously saved variables
- Expose API via _HTTP_ which can:
  - accept training data via _POST_
  - train new model in the background
  - list all trained models
  - generate text based on selected trained model
- Run it on AWS

## Text generator

As it happens there are examples of simple text generators in the web. I am interested in _simple_ examples which leads me to a character generator detailed in Andrei Karpathy's blog post ["The Unreasonable Effectiveness of Recurrent Neural Networks (RNN)"](http://karpathy.github.io/2015/05/21/rnn-effectiveness/) published in mid 2015. This RNN example relieves me from any explanations how/why it works and is generally concise in its implementation.

Part of the problem is solved but current article mentions [Tensorflow](https://www.tensorflow.org/) and [Karpathy's implementation](https://github.com/karpathy/char-rnn) is written in [Torch](http://torch.ch/). For this reason there was a reimplementation of `char-rnn` I found in another _Github_ repository [hzy46/Char-RNN-TensorFlow](https://github.com/hzy46/Char-RNN-TensorFlow) which I [forked and tweaked](https://github.com/ivarprudnikov/char-rnn-tensorflow).

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

## Access over _HTTP_

Given we have `python` scripts for training and character generation it is possible to wrap those in a simple _app_ exposed to the public internet. User will be able to upload and train her own sample then generate some text after training finishes.

To build an app I'll use Node.js with Express framework. There will be couple of publicly accessible paths to deal with uploading of training data, training of that data and generating text out of it. User will also be able to see other submissions as we do not care about security and accounts to make this exercise simpler.

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

```mysql
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
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'rnn_generator'
})

pool.query("select * from model order by updated_at desc limit ? offset ?", [10, 0], (error, rows) => {
  console.log(rows)
})
```

### Python scripts

## Deployment to AWS

### Docker

### Travis CI

### Elastic beanstalk

## Source code
