const fs = require('fs');
const path = require('path');
const query = require('./scripts/httpQuery');
const campusOptions = require('./config/campusIT');
const leftOnly = require('./scripts/leftOnly');
const express = require('express');
const moment = require('moment');

const app = express();
const port = 9000;
app.get('/', (req, res) => {
  TheBusiness();
  res.send('Updating permissions groups at: '+ moment().format('YYYY-MM-DD HH:mm:ss'));
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

// on startup, run TheBusiness once, then wait for subsequent Express requests
TheBusiness();

function TheBusiness() {
  // Initiate Campus Requests
  let campusPromises = new Promise((resolve, reject) => {
    // Get the Campus IT Token
    // console.log(campusOptions.connectConfig);
    query(campusOptions.connectConfig).then(values => { // Query returns is a Promise too
      campusToken = JSON.parse(values);
      campusOptions.queryConfig.get.options.headers.Authorization = campusToken.data.token;
      campusLists = getCampusLists(); // campusLists has properties "promises" and "index"
      Promise.all(campusLists.promises).then(values => {
        const obj = {};
        for (var i = 0; i < values.length; i++) {
          if (values[i] === 'failed') {
            // this error is re-iterated later too
            console.error('Warning: Failed to retreive campus list for: ', campusLists.index[i]);
          } else {
            obj[campusLists.index[i]] = values[i];
          }
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
    // console.log(libcal.bookings)
    // for each LibCal category, match it with the campus shortname defined in campusIT.js
    // note: the LibCal.name must exactly match the .name property defined in campusIT.js
    cids.forEach(libCalElement => {
      campusOptions.software.map(item => {
        if (libCalElement.name == item.name) {
          libCalElement.campuscode = item.shortName;
        }
      })
    });
    cids.forEach(element => {
      // return books for that software category ("category" == "software package", etc); return only uniqueID, not full email
      // so far, no limiting by checkout dates -- NEED TO DO THAT
      // console.log('Libcal bookings', libcal.bookings)

      // only look at bookings in the current category (cid)
      let category_bookings = libcal.bookings.filter(obj => { return obj.cid === element.cid });

      // limit to current bookings (not future bookings)
      let current_bookings = category_bookings.filter(obj => {
        let toDate = Date.parse(obj.toDate);
        let fromDate = Date.parse(obj.fromDate);
        return ((Date.now() > fromDate) && (Date.now() < toDate))
      });

      // limit to confirmed bookings (not cancelled, etc)
      let confirmed_bookings = current_bookings.filter(obj => { return obj.status === 'Confirmed' });
      bookings[element.campuscode] = confirmed_bookings.map(obj => { return obj.email.substring(0, obj.email.indexOf('@')) });
    });
    console.log('LibCal Bookings: ', bookings);
    console.log('Campus Lists:', campus)
    UpdateGroupMembers(bookings, campus);
  }).catch((error) => {
    console.error(error)
  })
}
/*********************************************** Functions (Should maybe be a class?) *************************************************************/

// /* Campus functions */

function UpdateGroupMembers(bookings, campus) {
  campusOptions.software.forEach(item => {
    // console.log(item.shortName,campus[item.shortName]);
    Divider();
    console.log('UPDATE', item.name)
    if (Array.isArray(campus[item.shortName])) {
      idsToDelete = leftOnly(campus[item.shortName], bookings[item.shortName]);
      idsToAdd = leftOnly(bookings[item.shortName], campus[item.shortName]);
      console.log('ADD:', idsToAdd);
      console.log('DELETE:', idsToDelete);
      campusAdditions(item.shortName, idsToAdd);
      campusDeletions(item.shortName, idsToDelete);
    } else {
      console.error("Warning: Could not get response from ActiveDirectory for:", item.shortName)
      Divider();
    }
  });
  console.log('Finished update :',Date.now())
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
    campusOptions.queryConfig.post.options.headers.Authorization = campusOptions.queryConfig.get.options.headers.Authorization
    campusOptions.queryConfig.post.data = { uniqueId: id }
    // console.log(campusOptions.queryConfig.post)
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
  Divider();
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
  if (Array.isArray(JSON.parse(response))) {
    return justUniqueIds(JSON.parse(response));
  } else {
    return ('failed');
  }
}

function getCampusLists() {
  // get list of campus software packages
  const software = campusOptions.software.map(item => { return item.shortName })
  promises = [];
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

// Utilities:

function Divider() {
  console.log('============================================');
}
