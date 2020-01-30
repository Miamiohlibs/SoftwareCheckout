const fs = require('fs');
const path = require('path');
const query = require('./scripts/httpQuery');
const campusOptions = require('./config/campusIT');
const express = require('express');
const moment = require('moment');
const libCal = require('./scripts/libCal.js');
const campus = require('./scripts/campus');
const utils = require('./scripts/utils');

const myArgs = process.argv.slice(2);
if (myArgs.includes('--listen')) {
  const app = express();
  const port = campusOptions.nodePort || 9000;
  app.get('/', (req, res) => {
    TheBusiness();
    res.send('Updating permissions groups at: ' + moment().format('YYYY-MM-DD HH:mm:ss'));
  });
  app.listen(port, () => console.log(`SoftwareCheckout app listening on port ${port}!`));
}

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
      campusLists = campus.getCampusLists(); // campusLists has properties "promises" and "index"
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
      const libCalLists = libCal.getLibCalLists(libCalToken, libCalOptions);
      Promise.all([libCalLists.bookings, libCalLists.categories]).then(values => {
        fs.writeFile('logs/bookings.log', JSON.stringify(JSON.parse(values[0]), null, '\t'), (err) => {
          if (err !== null) { console.log('Error writing bookings log:', err); }
        })
        fs.writeFile('logs/categories.log', JSON.stringify(JSON.parse(values[1]), null, '\t'), (err) => {
          if (err !== null) { console.log('Error writing categories log:', err); }
        })
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
    campusP = values[0];
    libcalP = values[1];
    cids = libcalP.categories[0].categories;
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
      let category_bookings = libcalP.bookings.filter(obj => { return obj.cid === element.cid });

      // limit to current bookings (not future bookings)
      let current_bookings = category_bookings.filter(obj => {
        let toDate = Date.parse(obj.toDate);
        let fromDate = Date.parse(obj.fromDate);
        return ((Date.now() > fromDate) && (Date.now() < toDate))
      });

      // limit to confirmed bookings (not cancelled, etc)
      let confirmed_bookings = current_bookings.filter(obj => { return obj.status === 'Confirmed' });

      // convert email addresses to uniqueIds
      emailPromises = confirmed_bookings.map(item => { return campus.convertEmailToUniq(item.email) });
      Promise.all(emailPromises).then(data => {
        bookings[element.campuscode] = data;
      })
    });

    Promise.all(emailPromises).then(() => {
      console.log('LibCal Bookings: ', bookings);
      console.log('Campus Lists:', campusP)
      campus.UpdateGroupMembers(bookings, campusP);
    });
  }).catch((error) => {
    console.error(error)
  })
}
