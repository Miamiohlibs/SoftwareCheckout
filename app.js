const fs = require('fs');
const path = require('path');
const query = require('./scripts/httpQuery');
const campusOptions = require('./config/campusIT');
const leftOnly = require('./scripts/leftOnly');

// Initiate Campus Requests
let campusPromises = new Promise((resolve, reject) => {
  // Get the Campus IT Token
  // console.log(campusOptions.connectConfig);
  query(campusOptions.connectConfig).then(values => { // Query returns is a Promise too
    campusToken = JSON.parse(values);
    campusOptions.queryConfig.get.options.headers.Authorization = campusToken.data.token;
    campusLists = getCampusLists(); // campusLists has properties "promises" and "index"
    console.log('campusLists', campusLists.promises)
    Promise.all(campusLists.promises).then(values => {
      console.log('raw values', values)
      const obj = {};
      for(var i=0; i<values.length; i++) {
        obj[campusLists.index[i]] = values[i];
      }
      resolve(obj);
    })
      .catch((error) => {
        console.error('Failed to get Campus info: ', error)
      });
  });
});

// Initiate LibCal Requests
let libCalPromises = new Promise((resolve, reject) => {
  const { oauth2, getToken, libCalOptions } = require('./scripts/libCalAuth');

  // With Token, make API calls
  getToken().then(values => {
    const libCalToken = values.access_token;
    libCalLists = getLibCalLists(libCalToken, libCalOptions);
    Promise.all([libCalLists.bookings, libCalLists.categories]).then(values => {
      resolve({ bookings: JSON.parse(values[0]), categories: JSON.parse(values[1]) });
    })
  })
    .catch((error) => {
      console.error('Failed to get LibCal info: ', error)
    });
})

// Compare results of Campus and LibCal results
Promise.all([campusPromises, libCalPromises]).then((values) => {
  bookings = [];
  campus = values[0];
  libcal = values[1];
  cids = libcal.categories[0].categories;
  cids.forEach(element => {
    if (element.name.includes('Photoshop')) {
      element.campuscode = 'photoshop';
    }
    if (element.name.includes('Illustrator')) {
      element.campuscode = 'illustrator';
    }
  });
  cids.forEach(element => {
    // return books for that software category (ps, illustrator, etc); return only uniqueID, not full email
    // so far, no limiting by checkout dates -- NEED TO DO THAT
    // console.log('Libcal bookings', libcal.bookings)
    bookings[element.campuscode] = libcal.bookings.filter(obj => { return obj.cid === element.cid }).map(obj => { return obj.email.substring(0, obj.email.indexOf('@')) });
  });
  campusOptions.software.forEach(item => {
    // console.log(item.name, '(LibCal):', bookings[item.shortName]);
    // console.log(item.name, '(Campus):', campus[item.shortName]);
  });
  console.log ('Bookings: ', bookings);
  console.log ('Campus Reg:', campus)
  UpdateGroupMembers(bookings, campus);
}).catch((error) => {
  console.error(error)
})

/*********************************************** Functions (Should maybe be a class?) *************************************************************/

// /* Campus functions */

function UpdateGroupMembers(bookings, campus) {
  campusOptions.software.forEach(item => {
    // console.log(item.shortName,campus[item.shortName]);
    console.log('UPDATE', item.name)
    idsToDelete = leftOnly(campus[item.shortName], bookings[item.shortName]);
    idsToAdd = leftOnly(bookings[item.shortName], campus[item.shortName]);
    console.log('ADD:', idsToAdd);
    console.log('DELETE:', idsToDelete);
    campusAdditions(item.shortName, idsToAdd);
    campusDeletions(item.shortName, idsToDelete);
  });
}

async function oneCampusUpdate(config) {
  // console.log(config)
  return await query(config);
}

function campusAdditions(software, adds) {
  promises = []
  adds.forEach(id => {
    // campusOptions.queryConfig.post = campusOptions.queryConfig.get;
    campusOptions.queryConfig.post.options.path = campusOptions.queryConfig.post.options.pathStem + 'dulb-patron' + software;
    // campusOptions.queryConfig.post.options.method = 'POST';
    campusOptions.queryConfig.post.data = { uniqueId: id }
    promises[id] = oneCampusUpdate(campusOptions.queryConfig.post);
  })

  Promise.all(promises).then(values => {
    console.log(software, 'additions complete');
  });

}

function campusDeletions(software, deletes) {
  promises = []
  deletes.forEach(id => {
    // campusOptions.queryConfig.post = campusOptions.queryConfig.get;
    campusOptions.queryConfig.delete.options.path = campusOptions.queryConfig.delete.options.pathStem + 'dulb-patron' + software + '/' + id;
    campusOptions.queryConfig.delete.options.headers.Authorization = campusOptions.queryConfig.get.options.headers.Authorization
    promises[id] = oneCampusUpdate(campusOptions.queryConfig.delete);
  })
  Promise.all(promises).then(values => {
    console.log(software, 'deletions complete');
  });

}
// takes an array of campus user info from the API and just returns a list of uniqueIds from the uniqueId field
function justUniqueIds(json) {
  ids = [];
  json.forEach(entry => {
    ids.push(entry.uniqueId);
  });
  return ids;
}

async function getOneCampusList(software) {
  let response = await query(campusOptions.queryConfig.get);
  // console.log(response)
  return justUniqueIds(JSON.parse(response));
}

function getCampusLists() {
  const software = ['photoshop', 'illustrator'];
  promises = [];
  console.log('type of promises: ', typeof promises)
  index = []
  software.forEach(element => {
    campusOptions.queryConfig.get.options.path = campusOptions.queryConfig.get.options.pathStem + 'dulb-patron' + element;
    promises.push(getOneCampusList(element))
    index.push(element);
  });
  return { promises: promises, index: index };
}
/* end Campus function */

/* LibCal functions */

async function getOneLibCalList(element, token, libCalOptions) {
  // only get category 8370: library software 
  if (element == 'categories') { var id = '/8370' } else { id = '' }

  libCalOptions.queryConfig.options.path = '/1.1/equipment/' + element + id;
  libCalOptions.queryConfig.options.headers = { Authorization: 'Bearer ' + token }
  // get a promise for each call

  promise = await query(libCalOptions.queryConfig).then((response) => {
    return (response);
  });

  return promise;
}

function getLibCalLists(myToken, myLibCalOptions) {
  const token = myToken;
  const libCalOptions = myLibCalOptions;
  libcalQueries = ['bookings', 'locations', 'overdue', 'categories'];
  promises = [];

  libcalQueries.forEach((element) => {
    promises[element] = getOneLibCalList(element, token, libCalOptions);
  });

  // console.log(promises)
  return promises;
} //end fn getLibCalLists
