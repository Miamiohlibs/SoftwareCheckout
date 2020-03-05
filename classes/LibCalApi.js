const query = require('../scripts/httpQuery')
module.exports = class LibCalApi {
  constructor(conf) {
    this.conf = conf;
    const required = ['credentials', 'queryConfig'];
    required.forEach(element => {
      if (!this.conf.hasOwnProperty(element)) {
        throw new Error('LibCalApi missing required property: ' + element);
      }
    });
  }

  async getToken() {
    const oauth2 = require('simple-oauth2').create(this.conf.credentials);
    try {
      const result = await oauth2.clientCredentials.getToken();
      // console.log(oauth2)
      // const accessToken = oauth2.accessToken.create(result);
      // console.log('Token: ', result);
      this.token = result.access_token;
      // console.log('Just token:', this.token)
      return Promise.resolve(this.token);
    } catch (err) {
      console.error('Access Token Error:', err.message);
    }
  }

  async getOneLibCalList(element, params = '') {
    const libCalOptions = this.conf;

    // only get location: library software 
    if (element == 'categories') { var id = '/' + this.conf.softwareLocation } else { id = '' }

    this.conf.queryConfig.options.path = '/1.1/equipment/' + element + id;
    this.conf.queryConfig.options.headers = { Authorization: 'Bearer ' + this.token }
    if (element == 'bookings') {
      this.conf.queryConfig.options.path += '?limit=100&lid=' + this.conf.softwareLocation + params;
    }
    console.log(this.conf.queryConfig.options.path, this.token)
    // get a promise for each call
    try {
      var promise = await query(this.conf.queryConfig).then((response) => {
        return (response);
      });
      return promise;
    } catch {
      console.error('failed to get libcal query')
    }
  }

  async getLibCalLists() {
    try {
      let categories = await this.getOneLibCalList('categories');
      let cats = JSON.parse(categories);
      console.log()
      const allLists = [];
      await this.asyncForEach(cats[0].categories, async item => {
        // console.log(item);
        let response = await this.getOneLibCalList('bookings', "&cid=" + item.cid);
        let parsed = JSON.parse(response);
        let obj = { cid: item.cid, name: item.name, bookings: parsed} //, categories: categories }
        // console.log('ID:',item.cid)
        // response[item.cid] = obj;
        allLists.push(obj)
      });
      return allLists;
    } catch (err) {
      console.log('Error getting LibCal lists:', err);
    }

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

