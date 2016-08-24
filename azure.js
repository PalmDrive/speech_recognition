'use strict';

const fs = require('fs'),
      request = require('request'),
      config = require('./config')['azure'],
      uuid = require('node-uuid');

const audioPath = './1.wav';

const authenticate = () => {
  const url = 'https://oxford-speech.cloudapp.net/token/issueToken',
        form = {
          grant_type: 'client_credentials',
          client_id: config.key,
          client_secret: config.key,
          scope: 'https://speech.platform.bing.com',
        };
  return new Promise((resolve, reject) => {
    request.post({
      url,
      json: true,
      form
    }, (err, res, body) => {
      if (err) {
        return reject(err);
      }
      resolve(res, body);
    });
  });
};

const speechRecognize = (token) => {
  const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'audio/wav; codec="audio/pcm"; samplerate=8000',
        },
        requestid = uuid.v4(),
        instanceid = '1d4b6030-9099-11e0-91e4-0800200c9a66';

  let url = 'https://speech.platform.bing.com/recognize/?version=3.0&appID=D4D52672-91D7-4C74-8AD8-42B1D98141A5&format=json&locale=zh-CN&scenarios=ulm&device.os=wp7';

  url = `${url}&requestid=${requestid}&instanceid=${instanceid}`;

  return new Promise((resolve, reject) => {
    fs.readFile(audioPath, (err, data) => {
      if (err) {
        return reject(err);
      }

      headers['Content-Length'] = data.length;

      request.post({
        url: url,
        body: data,
        headers,
      }, (err, res, body) => {
        if (err) {
          return reejct(err);
        }

        resolve(res, body);
      });
    });
  });
};

authenticate()
  .then((res, body) => {
    const accessToken = res.body.access_token;
    console.log('token:', accessToken);
    return speechRecognize(accessToken);
  })
  .then((res, body) => {
    console.log('res body:', res.body);
  }, err => {
    console.log(err);
  });
