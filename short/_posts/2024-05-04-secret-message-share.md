---
layout: post
title: Secret message share
---

A small side project: a “burn after reading” platform for sharing sensitive text.

Source: https://github.com/ivarprudnikov/secret-message-share

Users create an account, store a piece of text (links/notes/encoded images), and share it via a unique URL. The recipient must enter a PIN to reveal the content.

## How it works

- Server generates an ID + PIN, encrypts the message, and stores only encrypted content plus a hashed PIN.
- Sender shares the ID/PIN out-of-band.
- Recipient opens the URL, enters the PIN, and on success the server decrypts and immediately deletes the message.
- The message is also deleted after multiple failed PIN attempts.

## Architecture

The backend is written in Go and runs on Azure Functions (HTTP). It’s stateless, with data stored in Azure Table Storage. Content is encrypted at rest and runtime configuration is provided via Function App environment variables (including keys for encryption and cookie auth).
