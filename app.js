const fs = require('fs');

// Get the API Token
const { oauth2, getToken } = require('./config/auth');

// With Token, make API calls
getToken().then(values => {
  const token = values.access_token;

  libcalQueries = ['bookings', 'locations', 'overdue'];
  promises = [];

  libcalQueries.forEach(element => {
    promises[element] = new Promise((resolve, reject) => {
      var query = require('./config/apiQuery')({ path: '/1.1/equipment/' + element, token: token }).then((result) => {
        fs.writeFile(element + '.log', result, (err) => {
          console.log('Wrote new data to ' + element + '.log');
        });
      })
        .catch('Failed to retrieve ' + element)
        .finally(resolve(element + ' done'));
    })
  });

  Promise.all([promises['bookings'], promises['locations'], promises['overdue']]).then((values) => {
    console.log('all the promises: ', values);
  })
})







