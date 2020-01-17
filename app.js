const fs = require('fs');
const path = require('path');
const query = require('./scripts/httpQuery');
const campusOptions = require('./config/campusIT');

// Get the Campus IT Token
query(campusOptions.connectConfig).then(values => {
  campusToken = JSON.parse(values);
});

// Get the LibCal API Token
const { oauth2, getToken, libCalOptions } = require('./scripts/libCalAuth');

// With Token, make API calls
getToken().then(values => {
  const libCalToken = values.access_token;
  libcalQueries = ['bookings', 'locations', 'overdue', 'categories'];
  var promises = [];

  libcalQueries.forEach(element => {
    // only get category 8370: library software 
    if (element == 'categories') { var id = '/8370' } else { id = '' }

    libCalOptions.queryConfig.options.path = '/1.1/equipment/' + element;
    libCalOptions.queryConfig.options.headers = { Authorization: 'Bearer ' + libCalToken }
    // get a promise for each call
    promises[element] = new Promise((resolve, reject) => {
      // execute an API call
      //console.log(libCalOptions.queryConfig.options)
      var query = require('./scripts/httpQuery')(libCalOptions.queryConfig)
        .then((result) => {
          fs.writeFile(path.join(__dirname, 'logs', element + '.log'), result, (err) => {
            console.log('Wrote new data to ' + element + '.log');
            resolve(result);
          });
        })
        .catch('Failed to retrieve ' + element)
    })
  });

  Promise.all([promises['bookings'], promises['locations'], promises['overdue'], promises['categories']]).then((values) => {
    // const cats = JSON.parse(values[libcalQueries.indexOf('categories')])[0].categories;
    var userlists = [];
    const bookings =  JSON.parse(values[libcalQueries.indexOf('bookings')]);

    // build an array of object, one per category ID (category ID = kind of software (photoshop,illustrator, etc))
    bookings.forEach((entry) => {
      //console.log(entry.cid + ' : ' +entry.email)
      var cid = entry.cid;
      if (! userlists[cid]) { userlists[cid] = []; }
      if (entry.email.includes('@miamioh.edu') || entry.email.includes('@muohio.edu')) {
        userlists[cid].push(emaientry.email);
      } else { 
        console.log('REJECTED NON-MIAMI ADDRESS: ',entry.email)
      }

    })
    //console.log(bookings)
    const ps_id = libCalOptions.software.photoshop.cid;
    console.log ('Photoshop: ', userlists[ps_id])
  })
})







