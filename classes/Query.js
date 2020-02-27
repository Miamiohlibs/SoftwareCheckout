const https = require('https');

module.exports = class Query {
  constructor ( configs = null , data = null ) {
    if (configs !== null ) { this.setConfigs(configs); }
    if (data !== null ) { this.setData(data); }
  }

  setConfigs(configs) {
    this.config = configs;
  }

  setData(data) {
    this.data = data;
  }

  async execute () {

  }

}