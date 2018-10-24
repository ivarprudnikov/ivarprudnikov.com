---
layout: post
title: Develop tensorflow application and deploy model to production
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

## Objectives

- Prepare text generator which takes training text as an argument
- Store text model variables for later reuse
- Develop API that generates text based on previously saved variables
- Expose API via _HTTP_ which can:
  - accept training data via _POST_
  - train new model in the background
  - list all trained models
  - generate text based on selected trained model
- Measure throughput of such application
- Improve existing models

### Text generator

As it happens there are examples of simple text generators in the web. I am interested in _simple_ examples which leads me to a character generator detailed in Andrei Karpathy's blog post ["The Unreasonable Effectiveness of Recurrent Neural Networks (RNN)"](http://karpathy.github.io/2015/05/21/rnn-effectiveness/) published in mid 2015. This RNN example relieves me from any explanations how/why it works and is generally concise in its implementation.

Part of the problem is solved but current article mentions [Tensorflow](https://www.tensorflow.org/) and [Karpathy's implementation](https://github.com/karpathy/char-rnn) is written in [Torch](http://torch.ch/). For this reason there was a reimplementation of `char-rnn` I found in another _Github_ repository [hzy46/Char-RNN-TensorFlow](https://github.com/hzy46/Char-RNN-TensorFlow) which I [forked and tweaked](https://github.com/ivarprudnikov/char-rnn-tensorflow).

#### Training

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

#### Generating text

After training completes and checkpoints were saved we can call another script to generate text for us:

```bash
python sample.py \
  --converter_path model/shakespeare/converter.pkl \
  --checkpoint_path model/shakespeare/ \
  --max_length 1000
```

Above script needs a path to checkpoint data to pull variable values from it and use in the rebuilt model, it also uses the vocabulary file which was dumped in the process of training, that includes characters used for text generation.

### _API_ over _HTTP_

Given we have `python` scripts for training and character generation it is possible to wrap those in a simple _microservice_ which will act as a webserver exposed to the public internet. For this I'll use _Node.js_ with its easy to use _API_ for building network services. First we need to create small server which accepts multipart data containing training text.

