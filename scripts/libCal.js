const query = require('./httpQuery');

/* LibCal functions */
module.exports = {

  getOneLibCalList: async function (element, token, libCalOptions) {
    // only get location: library software 
    if (element == 'categories') { var id = '/' + libCalOptions.softwareLocation } else { id = '' }

    libCalOptions.queryConfig.options.path = '/1.1/equipment/' + element + id;
    libCalOptions.queryConfig.options.headers = { Authorization: 'Bearer ' + token }
    if (element == 'bookings') {
      libCalOptions.queryConfig.options.path += '?limit=100&lid=' + libCalOptions.softwareLocation;
    }

    // get a promise for each call
    promise = await query(libCalOptions.queryConfig).then((response) => {
      return (response);
    });

    return promise;
  },

  getLibCalLists: function (myToken, myLibCalOptions) {
    const token = myToken;
    const libCalOptions = myLibCalOptions;
    libcalQueries = ['bookings', 'locations', 'overdue', 'categories'];
    promises = [];

    libcalQueries.forEach((element) => {
      promises[element] = this.getOneLibCalList(element, token, libCalOptions);
    });

    // console.log(promises)
    return promises;
  } //end fn getLibCalLists

}