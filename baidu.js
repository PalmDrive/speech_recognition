'use strict';

const fs = require('fs'),
      request = require('request'),
      config = require('./config')['baidu'],
      uuid = require('node-uuid');

const audioPath1 = './13eb8c10-3b82-11e6-a9db-4d08d52f0a6b.wav',
      cuid = 'a4:5e:60:e8:fc:db';

const audioPath = './1.wav';

// Access token obtained on July 7, 2016
// { access_token: '24.5de4a120fa82ca95050ab5dddb3d875e.2592000.1470519556.282335-8345163',
//   session_key: '9mzdDtbW8hCh6j5tNkTDyMG0ga6+CPbk8BdwRcUEcDKqgNtS9LwmuoiEvX+HvcId/HSQeJHinSpm771+cZjTgYEbG21B',
//   scope: 'public audio_voice_assistant_get wise_adapt lebo_resource_base lightservice_public hetu_basic lightcms_map_poi kaidian_kaidian wangrantest_test wangrantest_test1',
//   refresh_token: '25.96fb4fff9c5ea4e553b88d999b3332cc.315360000.1783287556.282335-8345163',
//   session_secret: 'ff5bc32fbf0a610ab0d138ddb84444d9',
//   expires_in: 2592000 }
const accessToken = '24.5de4a120fa82ca95050ab5dddb3d875e.2592000.1470519556.282335-8345163';

const authenticate = () => {
  const url = 'https://openapi.baidu.com/oauth/2.0/token',
        qs = {
          grant_type: 'client_credentials',
          client_id: config.apiKey,
          client_secret: config.secretKey
        };
  return new Promise((resolve, reject) => {
    request.post({
      url,
      qs,
      json: true
    }, (err, res, body) => {
      if (err) {
        return reject(err);
      }
      resolve(res, body);
    });
  });
};

const speechRecognize = (token) => {
  const url = 'http://vop.baidu.com/server_api',
        sizeLimit = 100 * 1000; // 1MB

  let body = {
    rate: 8000,
    channel: 1,
    token,
    format: 'wav',
    cuid,
    lan: 'zh'
  };

  let p = '';

  const _speechToText = (data) => {
    if (data.length <= sizeLimit) {
      body.speech = data.toString('base64');
      body.len = data.length;
      return new Promise((resolve, reject) => {
        request.post({
          url: url,
          json: true,
          body
        }, (err, res, body) => {
          if (err) {
            return reject(err);
          }

          // console.log(res.body);
          if (res.body.err_no === 0) {
            p += res.body.result[0];
            p += ' ';
            console.log(res.body.result[0]);
          }

          resolve(res, body);
        });
      });
    } else {
      return _speechToText(data.slice(0, sizeLimit))
        .then((res, body) => {
          return _speechToText(data.slice(sizeLimit, data.length));
        });
    }
  };

  return new Promise((resolve, reject) => {
    fs.readFile(audioPath, (err, buffer) => {
      _speechToText(buffer)
        .then(() => {

          console.log(p);
          resolve(true);
        }, err => reject(err));
    });
  });
};

// authenticate()
//   .then(res => {
//     console.log(res.body);
//   }, err => console.log(err));
speechRecognize(accessToken)
  .then(() => {
    console.log('== done ==');
  }, err => {
    console.log(err);
  });
