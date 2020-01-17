const fs = require('fs');
const path = require('path');
const getCampusToken = require('./config/campusIT');

// Get the Campus IT Token
getCampusToken().then(values => {
  campusToken = JSON.parse(values);
});

// Get the LibCal API Token
const { oauth2, getToken, software  } = require('./config/auth');

// With Token, make API calls
getToken().then(values => {
  const token = values.access_token;

  libcalQueries = ['bookings', 'locations', 'overdue', 'categories'];
  var promises = [];

  libcalQueries.forEach(element => {
    if (element == 'categories') { var id = '/8370'} else { id = ''}
    promises[element] = new Promise((resolve, reject) => {
      var query = require('./config/apiQuery')({ path: '/1.1/equipment/' + element + id, token: token }).then((result) => {
        fs.writeFile(path.join(__dirname,'logs',element + '.log'), result, (err) => {
          console.log('Wrote new data to ' + element + '.log');
          resolve(result);
        });
      })
        .catch('Failed to retrieve ' + element)
    })
  });

  Promise.all([ promises['bookings'], promises['locations'], promises['overdue'], promises['categories'] ]).then((values) => {
    // const cats = JSON.parse(values[libcalQueries.indexOf('categories')])[0].categories;

  })
})







