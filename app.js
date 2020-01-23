const fs = require('fs');
const path = require('path');
const query = require('./scripts/httpQuery');
const campusOptions = require('./config/campusIT');
const leftOnly = require('./scripts/leftOnly');

// Initiate Campus Requests
let campusPromises = new Promise((resolve, reject) => {
  // Get the Campus IT Token
  query(campusOptions.connectConfig).then(values => { // Query returns is a Promise too
    campusLists = [];
    campusToken = JSON.parse(values);
    campusOptions.queryConfig.get.options.headers.Authorization = campusToken.data.token;
    campusOptions.queryConfig.get.options.path += 'dulb-patronphotoshop';
    campusLists = getCampusList();
    resolve(campusLists); // this returns a value to campusPromises
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
})

// Compare results of Campus and LibCal results
Promise.all([campusPromises, libCalPromises]).then((values) => {
  campus = values[0];
  libcal = values[1];
  console.log(libcal)
  // getLibCalSoftwareById(libcal);
  
}).catch((error) => {
  console.error(error)
})

//  function getLibCalSoftwareById(lc) {
//   readLibCalResults(lc);
//   } 

// async function readLibCalResults () {
//   lcGroups = ['bookings','categories']
//   lcResults = [];
//   lcGroups.forEach(async r => {
//     //console.log ('LC', lc[r])
//     let resultGroup = await lc[r].then(result => {return JSON.parse(result)});
//     lcResults[r] = resultGroup;
//   })
//   console.log('groups: ', lcResults)
// }



// // just try getting Photoshop; later we'll replace this with a foreEach software:




// // Get the LibCal API Token
// const { oauth2, getToken, libCalOptions } = require('./scripts/libCalAuth');

// // With Token, make API calls
// getToken().then(values => {
//   const libCalToken = values.access_token;
//   libcalQueries = ['bookings', 'locations', 'overdue', 'categories'];
//   var promises = [];

//   libcalQueries.forEach(element => {
//     // only get category 8370: library software 
//     if (element == 'categories') { var id = '/8370' } else { id = '' }

//     libCalOptions.queryConfig.options.path = '/1.1/equipment/' + element + id;
//     libCalOptions.queryConfig.options.headers = { Authorization: 'Bearer ' + libCalToken }
//     // get a promise for each call
//     promises[element] = new Promise((resolve, reject) => {
//       // execute an API call
//       console.log(libCalOptions.queryConfig.options)
//       var query = require('./scripts/httpQuery')(libCalOptions.queryConfig)
//         .then((result) => {
//           fs.writeFile(path.join(__dirname, 'logs', element + '.log'), result, (err) => {
//             console.log('Wrote new data to ' + element + '.log');
//             resolve(result);
//           });
//         })
//         .catch('Failed to retrieve ' + element)
//     })
//   });

//   Promise.all([promises['bookings'], promises['locations'], promises['overdue'], promises['categories'], campus_ps_promise]).then((values) => {
//     // const cats = JSON.parse(values[libcalQueries.indexOf('categories')])[0].categories;
//     var userlists = [];
//     const bookings =  JSON.parse(values[libcalQueries.indexOf('bookings')]);

//     // build an array of object, one per category ID (category ID = kind of software (photoshop,illustrator, etc))
//     bookings.forEach((entry) => {
//       // console.log(entry.cid + ' : ' +entry.email)
//       var cid = entry.cid;
//       if (! userlists[cid]) { 
//         userlists[cid] = []; 
//         // console.log('created array entry for ', cid)
//       }
//       if (entry.email.includes('@miamioh.edu') || entry.email.includes('@muohio.edu')) {
//         // console.log('tryna push ',entry.email)
//         userlists[cid].push(entry.email.substring(0,entry.email.indexOf('@')));
//       } else { 
//         console.log('REJECTED NON-MIAMI ADDRESS: ',entry.email)
//       }

//     })
//     //console.log(bookings)
//     const ps_id = libCalOptions.software.photoshop.cid;
//     console.log ('Photoshop checkouts in LibCal: ', userlists[ps_id])

//   })
// })


/* Campus functions */

function justUniqueIds(json) {
  ids = [];
  json.forEach(entry => {
    ids.push(entry.uniqueId);
  });
  return ids;
}

async function getCampusList() {
  let campusListValues = await query(campusOptions.queryConfig.get).then(listValues => {
    //console.log('Photoshop query: ', listValues)
    return JSON.parse(listValues);
  });
  return justUniqueIds(campusListValues);
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

/* end LibCal function */
