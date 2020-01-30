const query = require('./httpQuery');
const utils = require('./utils');
const leftOnly = require('./leftOnly');
const campusOptions = require('../config/campusIT');

module.exports = {

  UpdateGroupMembers: function (bookings, campus) {
    campusOptions.software.forEach(item => {
      // console.log(item.shortName,campus[item.shortName]);
      utils.Divider();
      console.log('UPDATE', item.name)
      if (Array.isArray(campus[item.shortName])) {
        idsToDelete = leftOnly(campus[item.shortName], bookings[item.shortName]);
        idsToAdd = leftOnly(bookings[item.shortName], campus[item.shortName]);
        console.log('ADD:', idsToAdd);
        console.log('DELETE:', idsToDelete);
        this.campusAdditions(item.shortName, idsToAdd);
        this.campusDeletions(item.shortName, idsToDelete);
      } else {
        console.error("Warning: Could not get response from ActiveDirectory for:", item.shortName)
        utils.Divider();
      }
    });
    console.log('Finished update :', Date.now())
  },

  oneCampusUpdate: async function (config) {
    // console.log(config)
    return await query(config);
  },

  campusAdditions: function (software, adds) {
    promises = []
    adds.forEach(id => {
      // campusOptions.queryConfig.post = campusOptions.queryConfig.get;
      campusOptions.queryConfig.post.options.path = campusOptions.queryConfig.post.options.pathStem + 'dulb-patron' + software;
      campusOptions.queryConfig.post.options.headers.Authorization = campusOptions.queryConfig.get.options.headers.Authorization
      campusOptions.queryConfig.post.data = { uniqueId: id }
      // console.log(campusOptions.queryConfig.post)
      promises[id] = this.oneCampusUpdate(campusOptions.queryConfig.post);
    })

    Promise.all(promises).then(values => {
      console.log(software, 'additions complete');
    });

  },

  campusDeletions: function (software, deletes) {
    promises = []
    deletes.forEach(id => {
      // campusOptions.queryConfig.post = campusOptions.queryConfig.get;
      campusOptions.queryConfig.delete.options.path = campusOptions.queryConfig.delete.options.pathStem + 'dulb-patron' + software + '/' + id;
      campusOptions.queryConfig.delete.options.headers.Authorization = campusOptions.queryConfig.get.options.headers.Authorization
      promises[id] = this.oneCampusUpdate(campusOptions.queryConfig.delete);
    })
    utils.Divider();
    Promise.all(promises).then(values => {
      console.log(software, 'deletions complete');
    });

  },

  // takes an array of campus user info from the API and just returns a list of uniqueIds from the uniqueId field
  justUniqueIds: function (json) {
    ids = [];
    json.forEach(entry => {
      ids.push(entry.uniqueId);
    });
    return ids;
  },

  getOneCampusList: async function (software) {
    let response = await query(campusOptions.queryConfig.get);
    // console.log(response)
    if (Array.isArray(JSON.parse(response))) {
      return this.justUniqueIds(JSON.parse(response));
    } else {
      return ('failed');
    }
  },

  getCampusLists: function () {
    // get list of campus software packages
    const software = campusOptions.software.map(item => { return item.shortName })
    promises = [];
    index = []
    software.forEach(element => {
      campusOptions.queryConfig.get.options.path = campusOptions.queryConfig.get.options.pathStem + 'dulb-patron' + element;
      promises.push(this.getOneCampusList(element))
      index.push(element);
    });
    return { promises: promises, index: index };
  },

  convertEmailToUniq: async function (email) {
    if (! email.includes('@')) { email += '@miamioh.edu'; }
    const escapedEmail = encodeURIComponent(email);
    campusOptions.queryConfig.convert.options.path = campusOptions.queryConfig.convert.options.pathStem + escapedEmail;
    let response  = await query(campusOptions.queryConfig.convert);
    let data = JSON.parse(response);
    uniq = data.data.uid;
    return uniq; // this is a promise, not a string!
  }
}