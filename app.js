const fs = require('fs');
const path = require('path');
const query = require('./scripts/httpQuery');
const campusOptions = require('./config/campusIT');
const leftOnly = require('./scripts/leftOnly');

/* campus functions */

function sanitizeCampusList(json) {
  emails = [];
  json.forEach(entry => {
    emails.push(entry.uniqueId);
  });
  return emails;
}

async function getCampusList () {
  let campusListValues = await query(campusOptions.queryConfig.get).then(listValues => {
    //console.log('Photoshop query: ', listValues)
    return JSON.parse(listValues);
   });
   return sanitizeCampusList(campusListValues);
}

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





  // let campusPromises = new Promise((resolve, reject) => {
  //   // Get the Campus IT Token
  //   query(campusOptions.connectConfig).then(values => {
  //     campusToken = JSON.parse(values);
  //     // console.log('CampusIT token: ', campusToken);
  //     campusOptions.queryConfig.get.options.headers.Authorization = campusToken.data.token;
  //     campusOptions.queryConfig.get.options.path += 'dulb-patronphotoshop';

  //     // With Campus token, get permissions lists for each software group
  //     campusLists = [];
  //     // Get lists of users:
  //     let campus_ps_promise = new Promise((resolve, reject) => {
  //       let listQuery = query(campusOptions.connectConfig).then(values => {
  //         .then((result) => {
  //           campusLists['Photoshop'] = [];
  //           JSON.parse(result).forEach((entry) => {
  //             campusLists['Photoshop'].push(entry.uniqueId);
  //             // console.log(entry.uniqueId)
  //           })
  //           console.log('Campus Photoshop Checkouts: ', campusLists['Photoshop']);
  //           resolve(campusLists);
  //         })
  //         .catch((error) => {
  //           console.error('Failed to get photoshop license list from campus IT');
  //           console.error(error);
  //           reject(error);
  //         });
  //     }).then((campusResults) => {
  //       console.log('Penultimate layer: ',campusResults)
  //       resolve(campusResults);
  //     })
  //   })
  // });

  let libCalPromises = new Promise((resolve, reject) => {
    resolve('jelly');
  })

  Promise.all([campusPromises, libCalPromises]).then((values) => {
    console.log(values);
  }).catch((error) => {
    console.error(error)
  })




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







