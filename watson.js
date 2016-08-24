'use strict';

const watson = require('watson-developer-cloud'),
      config = require('./config')['watson'],
      fs = require('fs');

const speechToText = watson.speech_to_text({
  username: config.username,
  password: config.password,
  version: 'v1'
});

const audioPath = './13eb8c10-3b82-11e6-a9db-4d08d52f0a6b.wav';
//const audioPath = './1.wav';

const speechRecognize = () => {
  const params = {
    audio: fs.createReadStream(audioPath),
    content_type: 'audio/wav',
    inactivity_timeout: -1,
    timestamps: true,
    model: 'zh-CN_NarrowbandModel',
    word_alternatives_threshold: 0.9,
    continuous: true
  };

  return new Promise((resolve, reject) => {
    speechToText.recognize(params, (err, data) => {
      if (err) { return reject(err); }
      resolve(data);
    });
  });
};

speechRecognize()
  .then(data => console.log(JSON.stringify(data, null, 2)), err => console.log(err));
