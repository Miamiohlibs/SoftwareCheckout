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
    campusLists = getCampusLists();
    Promise.all([campusLists.photoshop, campusLists.illustrator]).then(values => {
 //     resolve( { photoshop: values[0], illustrator: values[1] })
  console.log(values)
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
  console.log(libcal.categories[0].categories)
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
    bookings[element.campuscode] = libcal.bookings.filter(obj => { return obj.cid === element.cid }).map(obj => { return obj.email.substring(0, obj.email.indexOf('@')) });
  });
  console.log(bookings)
  // let photoshop_bookings = libcal.bookings.filter(obj => {return obj.cid === 15705}).map(obj => { return obj.email.substring(0,obj.email.indexOf('@')) });
  // let illustrator_bookings = libcal.bookings.filter(obj => { return obj.cid === 15809 }).map(obj => { return obj.email });;
  /* can we subsequently filter by between-dates? */
  /* then just return uniqueIds */
  // console.log('PS: ', photoshop_bookings);
  // console.log('ILL: ', illustrator_bookings);  
}).catch((error) => {
  console.error(error)
})

// /* Campus functions */

// takes an array of campus user info from the API and just returns a list of uniqueIds from the uniqueId field
function justUniqueIds(json) {
  ids = [];
  json.forEach(entry => {
    ids.push(entry.uniqueId);
  });
  return ids;
}

async function getOneCampusList(software) {
  return await query(campusOptions.queryConfig.get);
}

function getCampusLists() {
  const software = ['photoshop','illustrator'];
  promises = [];
  software.forEach(element => {
    campusOptions.queryConfig.get.options.path = campusOptions.queryConfig.get.options.pathStem + 'dulb-patron' +element;
    promises[element] = getOneCampusList(element);
  });
  return promises;
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
