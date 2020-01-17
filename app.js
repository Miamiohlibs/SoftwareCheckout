const fs = require('fs');
const path = require('path');
const query = require('./scripts/httpQuery');
const campusOptions = require('./config/campusIT');

// Get the Campus IT Token
query(campusOptions.connectConfig).then(values => {
  campusToken = JSON.parse(values);
});

// // Get the LibCal API Token
// const { oauth2, getToken, libCalOpts } = require('./config/auth');

// // With Token, make API calls
// getToken().then(values => {
//   const token = values.access_token;

//   libcalQueries = ['bookings', 'locations', 'overdue', 'categories'];
//   var promises = [];

//   libcalQueries.forEach(element => {
//     // only get category 8370: library software 
//     if (element == 'categories') { var id = '/8370' } else { id = '' }

//     // get a promise for each call
//     promises[element] = new Promise((resolve, reject) => {
//       // execute an API call
//       var query = require('./config/apiQuery')(
//         {
//           path: '/1.1/equipment/' + element + id,
//           token: token,
//           hostname: libCalOpts.httpsOptions.hostname,
//           method: 'GET'
//         })
//         .then((result) => {
//           fs.writeFile(path.join(__dirname, 'logs', element + '.log'), result, (err) => {
//             console.log('Wrote new data to ' + element + '.log');
//             resolve(result);
//           });
//         })
//         .catch('Failed to retrieve ' + element)
//     })
//   });

//   Promise.all([promises['bookings'], promises['locations'], promises['overdue'], promises['categories']]).then((values) => {
//     // const cats = JSON.parse(values[libcalQueries.indexOf('categories')])[0].categories;

//   })
// })







