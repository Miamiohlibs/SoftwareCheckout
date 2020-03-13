const Query = require('./Query');
const jwtAuth = require('@adobe/jwt-auth');
const path = require('path');
const fs = require('fs');

module.exports = class AdobeUserMgmtApi {
  constructor(conf) {
    this.credentials = conf.credentials;
    this.queryConf = conf.queryConf;
    this.credentials.privateKey = fs.readFileSync(path.join(__dirname, conf.certs.privateKeyFile), 'utf8');
    // this.credentials.privateKey = this.privateKey;
  }

  async getToken() {
    let tokenResponse = await jwtAuth(this.credentials);
    this.accessToken = tokenResponse.access_token;
    return tokenResponse.access_token;
    // this.accessToken = tokenResponse;
  }

  // start with a basic set of options, add or overwrite with new options
  querySetup(baseOpts, opts) {
    this.currOpts = JSON.parse(JSON.stringify(this.queryConf[baseOpts].options)); //clone values, don't pass by reference

    if (opts.hasOwnProperty('headers')) { 
      var tmpHeaders = opts.headers;
      delete opts.headers;
    }
    this.currOpts = Object.assign(this.currOpts, opts);
    if (typeof tmpHeaders !== 'undefined') {
     this.currOpts.headers = Object.assign(this.currOpts.headers, tmpHeaders); 
    }


    // for (const property in opts) {
    //   // if(property === 'headers') {
    //   //   //add to headers, don't overwrite them
    //   //   this.currOpts.headers.assign(opts['headers']);
    //   // }
    //   this.currOpts = Object.assign(this.currOpts, opts[property]);
    // }
  }
}