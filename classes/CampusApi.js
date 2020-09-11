const Query = require('./Query');

module.exports = class CampusApi {
  constructor(conf) {
    this.conf = conf;
  }

  justUniqueIds(json) {
    let ids = [];
    json.forEach((entry) => {
      ids.push(entry.uniqueId);
    });
    return ids;
  }

  async convertEmailToUniq(email) {
    if (email != undefined && !email.includes('@')) {
      email += this.conf.emailDomain;
    }
    const escapedEmail = encodeURIComponent(email);
    this.conf.queryConf.convert.options.path =
      this.conf.queryConf.convert.options.pathStem + escapedEmail;
    let query = new Query(this.conf.queryConf.convert);
    let response = await query.execute();
    // console.log('Convert response:',response);
    let data = JSON.parse(response);
    let uniq = data.data.uid;
    return uniq;
  }

  async convertMultipleEmails(arr) {
    let output = arr.map((email) => this.convertEmailToUniq(email));
    // console.log(output);
    let result = Promise.all(output).then((res) => {
      // console.log('now resolved:', res);
      return res;
    });
    return result;
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
};
