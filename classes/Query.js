/*
curl -X POST -d 'weather=rain&forecast=rain' -H "Content-Type: application/x-www-form-urlencoded"  https://ulblwebt03.lib.miamioh.edu/~irwinkr/post_json.php


curl -X POST -d '{"weather":"rain"}' -H "Content-Type: application/json"  https://ulblwebt03.lib.miamioh.edu/~irwinkr/post_json.php

*/

const https = require('https');
const qs = require('querystring')

module.exports = class Query {
  constructor(queryConf = null, auth = null, data = null) {
    if (queryConf !== null) { this.setQueryConf(queryConf); }
    if (auth !== null) { this.setAuth(auth); }
    if (data !== null) { this.setData(data); }
  }

  setQueryConf(configs) {
    this.queryConf = configs;
  }

  setAuth(auth) {
    this.auth = auth;
  }

  setData(data) {
    this.data = data;
  }

  execute(mode = 'json') {
    if (mode == 'form') {
      this.queryConf.options.headers = {
        'Content-type': 'application/x-www-form-urlencoded'
      }
    } else {
      this.queryConf.options.headers = {
        'Content-type': 'application/json'
      }
    }
    return new Promise((resolve, reject) => {
      const req = https.request(this.queryConf.options, (res) => {
        // console.log(options);
        res.setEncoding('utf8');
        var responseBody;

        res.on('data', (chunk) => {
          responseBody += chunk;
        });

        res.on('end', () => {
          // console.log('RESPONSE: ', responseBody)
          resolve(responseBody);
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      if (this.data !== undefined) {
        if (mode == 'form') { 
          // console.log('doing string form');
          let data = qs.stringify(this.data);
          // console.log('Data:', data);
          req.write(data);
        } else {
          // console.log('doing string JSON');
          let data = JSON.stringify(this.data);
          // console.log('Data:', data);
          req.write(data);
        }
      }
      req.end();
    });
  };

}