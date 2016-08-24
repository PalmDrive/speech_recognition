'use strict';

var fs = require('fs');
var util = require('util');
var request = require('request');

const config = require('./config');

var clientId = 'test-app';                             // Can be anything
var clientSecret = '73ad2dc754c24016a8730fd62e4df711';//config.key; // API key from Azure marketplace

var str = 'This is a cool demo to call Microsoft text to speach service in Node.js.';

console.log('Converting from text -> speech -> text.');
console.log('Input text: "' + str + '"');

getAccessToken(clientId, clientSecret, function(err, accessToken) {
  if(err) return console.log(err);
  console.log('Got access token: ' + accessToken)

  textToSpeech(str, 'test.wav', accessToken, function(err) {
    if(err) return console.log(err);
    console.log('Wrote out: ' + 'test.wav');

    speechToText('test.wav', accessToken, function(err, res) {
      if(err) return console.log(err);
      console.log('res:', res.body);
      // console.log('Confidence ' + res.results[0].confidence + ' for: "' + res.results[0].lexical + '"');
    });
  });
})

// ==== Helpers ====

function getAccessToken(clientId, clientSecret, callback) {
  request.post({
    url: 'https://oxford-speech.cloudapp.net/token/issueToken',
    form: {
      'grant_type': 'client_credentials',
      'client_id': encodeURIComponent(clientSecret),
      'client_secret': encodeURIComponent(clientSecret),
      'scope': 'https://speech.platform.bing.com'
    }
  }, function(err, resp, body) {
    if(err) return callback(err);
    try {
      var accessToken = JSON.parse(body).access_token;
      if(accessToken) {
        callback(null, accessToken);
      } else {
        callback(body);
      }
    } catch(e) {
      callback(e);
    }
  });
}

function textToSpeech(text, filename, accessToken, callback) {
  var ssmlTemplate = "<speak version='1.0' xml:lang='en-us'><voice xml:lang='%s' xml:gender='%s' name='%s'>%s</voice></speak>";
  request.post({
    url: 'http://speech.platform.bing.com/synthesize',
    body: util.format(ssmlTemplate, 'en-US', 'Female', 'Microsoft Server Speech Text to Speech Voice (en-US, ZiraRUS)', text),
    encoding: null,
    headers: {
      'Authorization': 'Bearer ' + accessToken,
      'Content-Type' : 'application/ssml+xml',
      'X-Microsoft-OutputFormat' : 'riff-16khz-16bit-mono-pcm',
      'X-Search-AppId': '07D3234E49CE426DAA29772419F436CA',
      'X-Search-ClientID': '1ECFAE91408841A480F00935DC390960',
    }
  }, function(err, resp, body) {
    if(err) return callback(err);
    fs.writeFile(filename, body, 'binary', function (err) {
      if (err) return callback(err);
      callback(null);
    });
  });
}

function speechToText(filename, accessToken, callback) {
  fs.readFile(filename, function(err, waveData) {
    if(err) return callback(err);
    request.post({
      json: true,
      url: 'https://speech.platform.bing.com/recognize',
      qs: {
        'scenarios': 'ulm',
        'appid': 'D4D52672-91D7-4C74-8AD8-42B1D98141A5', // This magic value is required
        'locale': 'en-US',
        'device.os': 'wp7',
        'version': '3.0',
        'format': 'json',
        'requestid': '1d4b6030-9099-11e0-91e4-0800200c9a66', // can be anything
        'instanceid': '1d4b6030-9099-11e0-91e4-0800200c9a66' // can be anything
      },
      body: waveData,
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'audio/wav; samplerate=16000',
        'Content-Length' : waveData.length
      }
    }, function(err, resp, body) {
      if(err) return callback(err);
       callback(null, resp);
    });
  });
}
