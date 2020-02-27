const https = require('https');

module.exports = class Query {
  constructor ( queryConf = null , auth = null, data = null ) {
    if (queryConf !== null ) { this.setQueryConf(queryConf); }
    if (auth !== null) { this.setAuth(auth); }
    if (data !== null ) { this.setData(data); }
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

  async execute () {

  }

}