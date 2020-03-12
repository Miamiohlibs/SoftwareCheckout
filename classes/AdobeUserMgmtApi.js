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
}