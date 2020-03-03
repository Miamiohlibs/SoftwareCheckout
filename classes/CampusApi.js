const Query = require('./Query');

module.exports = class CampusApi {
  constructor(conf) {
    this.conf = conf;
    this.getCampusListNames();
  }

  getCampusListNames() {
    this.campusListNames = this.conf.software.map(item => { return item.shortName });
    return this.campusListNames;
  }

  async getToken() {
    let api = new Query(this.conf.connectConfig, null, this.conf.connectConfig.data);
    let response = await api.execute();
    let tokenObj = JSON.parse(response);
    this.token = tokenObj.data.token;
    return this.token;
  }

  async getListValues() {
    obj = {};
    this.campusListNames.foreEach(id => {

    });
    return obj;
  }

  async getOneList(listName) {
    this.conf.queryConfig.get.options.headers.Authorization = this.token;
    this.conf.queryConfig.get.options.path = this.conf.queryConfig.get.options.pathStem + 'dulb-patron' + listName;
    // console.debug(this.conf.queryConfig.get.options)
    let query = new Query(this.conf.queryConfig.get);
    let values = await query.execute();
    if (this.isJson(values)) {
      return JSON.parse(values);
    } else {
      return "failed";
    }
    console.log('Heres what we got back:',values)
  }

  isJson(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }
}

// curl https://community.miamioh.edu/directory-accounts/api/members/dulb-patronadobecc