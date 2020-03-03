const Query=require('./Query');

module.exports = class CampusApi {
  constructor (conf) {
    this.conf = conf;
  }

  async getToken() {
    let api = new Query(this.conf.connectConfig, null, this.conf.connectConfig.data);
    let response = await api.execute();
    let tokenObj = JSON.parse(response);
    this.token = tokenObj.data.token;
    return;
  }
}