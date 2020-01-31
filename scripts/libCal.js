const query = require('./httpQuery');

/* LibCal functions */
module.exports = {

  getOneLibCalList: async function (element, token, libCalOptions, params) {
    // only get location: library software 
    if (element == 'categories') { var id = '/' + libCalOptions.softwareLocation } else { id = '' }

    libCalOptions.queryConfig.options.path = '/1.1/equipment/' + element + id;
    libCalOptions.queryConfig.options.headers = { Authorization: 'Bearer ' + token }
    if (element == 'bookings') {
      libCalOptions.queryConfig.options.path += '?limit=100&lid=' + libCalOptions.softwareLocation + params;
    }

    // get a promise for each call
    promise = await query(libCalOptions.queryConfig).then((response) => {
      return (response);
    });

    return promise;
  },

  getLibCalLists: async function (myToken, myLibCalOptions) {
    const token = myToken;
    const libCalOptions = myLibCalOptions;

    let response = await this.getOneLibCalList('categories', token, libCalOptions);
    cats = JSON.parse(response)[0];
    const categories = cats; // make a static copy to return in each object
    // console.log(cats);
    promises = cats.categories.map(async item => {
      let response = await this.getOneLibCalList('bookings', token, libCalOptions, "&cid=" + item.cid);
      let p = JSON.parse(response);
      let obj = { cid: item.cid, name: item.name, bookings: p, categories: categories }
      // console.log(obj)
      return obj;
    })
    // console.log(promises)
    // console.log(promises.length)
    return promises;
  } //end fn getLibCalLists
}