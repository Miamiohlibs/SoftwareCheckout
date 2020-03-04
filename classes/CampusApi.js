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
    // console.debug('got campus token:',this.token)
    return this.token;
  }

  async getMultipleLists() {
    if (api.token === undefined) { 
      await api.getToken();
    }
    let itemList = {}
    await this.asyncForEach(this.campusListNames, async item => {
      let response = await api.getOneList(item);
      itemList[item] = response;
    });
    return itemList;
  }

  async getOneList(listName) {
    if (api.token === undefined) { 
      await api.getToken();
    }
    this.conf.queryConfig.get.options.headers.Authorization = this.token;
    this.conf.queryConfig.get.options.path = this.conf.queryConfig.get.options.pathStem + 'dulb-patron' + listName;
    // console.debug(this.conf.queryConfig.get.options)
    let query = new Query(this.conf.queryConfig.get);
    let values = await query.execute();
    // console.debug(typeof JSON.parse(values))
    if (this.isJson(values)) {
      let obj = JSON.parse(values);
      return this.justUniqueIds(obj);
    } else {
      return "failed";
    }
    // console.debug('Heres what we got back:',values)
  }

  justUniqueIds(json) {
    let ids = [];
    json.forEach(entry => {
      ids.push(entry.uniqueId);
    });
    return ids;
  }


  /* Utility functions */

  isJson(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }


// asyncForEach 
// from: https://codeburst.io/javascript-async-await-with-foreach-b6ba62bbf404
// by: Sebastien Chopin

async asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}


}