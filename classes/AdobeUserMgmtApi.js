module.exports = class AdobeUserMgmtApi {
  constructor (conf) {
    this.conf = conf;
  } 

  readConf (key) {
    return this.conf.values.filter(item => { return item.key == key })[0].value;
  }
}