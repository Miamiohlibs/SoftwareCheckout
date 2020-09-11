const https = require('https');
const util = require('util');
const fs = require('fs');
const async = require('async');
const express = require('express');
const moment = require('moment');
const LibCalApi = require('./classes/LibCalApi');
const libCalConf = require('./config/libCal');
const appConf = require('./config/appConf');
const adobeConf = require('./config/adobe');
const AdobeApi = require('./classes/AdobeUserMgmtApi');
const CampusApi = require('./classes/CampusApi');
const campusConf = require('./config/campusConf');
const utils = require('./scripts/utils');
let campus = new CampusApi(campusConf);

utils.Divider();
console.log(
  'Starting SoftwareCheckout at:',
  moment().format('YYYY-MM-DD HH:mm:ss')
);

// uncomment this line to suppress debug messages
// comment-out the line to get more logs
// console.debug = () => {};

/* SERVER SETUP */
// is this running on the server, or on another machine
// (if on a webserver, we'll want an SSL certificate below)
if (
  !appConf.hasOwnProperty('server') ||
  !appConf.server.hasOwnProperty('name')
) {
  global.onServer = false;
} else if (process.env.HOSTNAME === appConf.server.name) {
  global.onServer = true;
} else {
  global.onServer = false;
}
console.log(`On Server? : ${global.onServer}`);

// parse command line args; if --listen, start express server
const myArgs = process.argv.slice(2);
if (myArgs.includes('--listen')) {
  const app = express();
  const PORT = appConf.nodePort || 9000;

  if (global.onServer === true) {
    const server = {
      key: '/etc/ssl/certs/ulblwebt03.lib.miamioh.edu.key',
      cert: '/etc/ssl/certs/ulblwebt03.lib.miamioh.edu.crt',
    };

    https
      .createServer(
        {
          key: fs.readFileSync(appConf.server.key),
          cert: fs.readFileSync(appConf.server.cert),
        },
        app
      )
      .listen(PORT, function () {
        console.log(
          `SoftwareCheckout app listening on port ${PORT}! Go to https://${process.env.HOSTNAME}:${PORT}/`
        );
      });
  } else {
    // if not on server, just serve without ssl
    app.listen(PORT, function () {
      console.log(
        `SoftwareCheckout app listening on port ${PORT}! Go to https://localhost:${PORT}/`
      );
    });
  }
  // listen for requests
  app.get('/', (req, res) => {
    TheBusiness().then((done) => {
      // finally, log when the script finishes
      console.log(
        'Finished update at:',
        moment().format('YYYY-MM-DD HH:mm:ss')
      );
      utils.Divider();
    });
    res.send(
      'Updating permissions groups at: ' +
        moment().format('YYYY-MM-DD HH:mm:ss')
    );
  });
}
/* END SERVER SETUP */

// on startup, run TheBusiness once, then wait for subsequent Express requests
TheBusiness().then((done) => {
  // finally, log when the script finishes
  console.log('Finished update at:', moment().format('YYYY-MM-DD HH:mm:ss'));
  utils.Divider();
});

async function TheBusiness() {
  utils.Divider();
  console.log('Starting update at:', moment().format('YYYY-MM-DD HH:mm:ss'));

  // Get LibCal Token
  try {
    lcApi = new LibCalApi(libCalConf);
    const lcToken = await lcApi.getToken();
    console.debug('LibCal token:', lcToken);
  } catch {
    console.error('Unable to get LibCal Token');
  }

  // get Adobe Token
  const adobe = new AdobeApi(adobeConf);
  try {
    await adobe.getToken();
    console.debug('Adobe token:', adobe.accessToken);
  } catch (err) {
    console.error('Unable to get Adobe token:', err);
  }

  // Get LibCal Lists
  let lcUserList = {};
  try {
    let lcSoftware = await lcApi.getLibCalLists();
    lcSoftware = lcApi.mapLibCal2ShortName(lcSoftware, appConf.software);
    console.debug(JSON.stringify(lcSoftware, null, 4));

    await async.eachOf(lcSoftware, async (software) => {
      if (software.bookings.length > 0) {
        let lcBookings = lcApi.getCurrentLibCalBookings(software.bookings);
        await campus.asyncForEach(lcBookings, async (input) => {
          // console.log('TRYING TO CONVERT EMAILS: ', lcUserList.length);
          let updated = await campus.convertEmailToUniq(input.email);
          if (updated != undefined) {
            // console.log('CONVERT: ', input.email, 'TO:', updated);
            if (!updated.includes(campusConf.emailDomain)) {
              input.email = updated + campusConf.emailDomain;
            }
          }
        });
        console.debug('LibCal bookings:', software.shortName, lcBookings);
        lcUserList[software.shortName] = lcBookings;
      }
    });

    console.log('LibCal bookings:', lcUserList);
  } catch (err) {
    console.error('Error getting LibCal lists:', err);
  }

  // get Adobe user lists, compare to libCal, update Adobe as appropriate
  let adobeUserList = {};
  let addToAdobe = {};
  let revokeFromAdobe = {};
  try {
    // get the configs connecting Adobe and LibCal list names
    const adobeGroupsData = adobe.getAdobeLists(appConf.software);
    const adobeGroups = adobeGroupsData.groups;
    if (adobeGroupsData.hasOwnProperty('errors')) {
      console.error('Errors in appConf.js:', adobeGroupsData.errors);
    }

    // foreach adobe list, get members and compare against libcal list
    // revoke any users not in the libcal list
    // add any members not in the adobe list
    await async.eachOf(adobeGroups, async (list) => {
      let response = await adobe.callGroupUsers(list.adobeGroupName);
      if (
        !JSON.parse(response).hasOwnProperty('result') ||
        JSON.parse(response).result != 'success'
      ) {
        console.error('Error reading Adobe group in:', list);
        console.error('One or more needed values may not be set');
        console.error('Raw response:', response);
      }
      // console.debug('list for:',list.adobeGroupName);
      adobeUserList[list.adobeGroupName] = adobe.getCurrentUsernames(
        JSON.parse(response)
      );

      // filter libcal response to determine what needs to be added to adobe:
      var thisLibCalListName = list.shortName;
      var thisAdobeListName = list.adobeGroupName;
      var thisLibCalList = lcUserList[thisLibCalListName];
      if (typeof thisLibCalList == 'undefined') {
        thisLibCalList = []; // prevetns error in next line
      }
      if (typeof thisAdobeList == 'undefined') {
        thisAdobeList = [];
      }
      var thisLibCalEmails = lcApi.getEmailsFromBookings(thisLibCalList);
      // console.log('Before:', thisLibCalEmails);
      // thisLibCalEmails = await campus.convertMultipleEmails(thisLibCalEmails);
      // console.log('After:', thisLibCalEmails);
      var thisAdobeList = adobeUserList[thisAdobeListName];
      console.log('Pair of lists: ', thisLibCalListName, thisAdobeListName);
      console.log(thisLibCalListName, '(libcal):', thisLibCalList.length);
      console.log(thisAdobeListName, '(adobe):', thisAdobeList.length);

      // await campus.asyncForEach(thisAdobeList, async (input) => {
      //   console.log('TRYING TO CONVERT EMAILS: ', thisAdobeList.length);
      //   let updated = await campus.convertEmailToUniq(input.email);
      //   if (updated != undefined) {
      //     console.log('CONVERT: ', input.email, 'TO:', updated);
      //     if (!updated.includes(campusConf.emailDomain)) {
      //       input.email = updated + campusConf.emailDomain;
      //     }
      //   }
      // });

      addToAdobe[thisAdobeListName] = adobe.filterBookingsToAdd(
        thisLibCalList,
        thisAdobeList
      );
      revokeFromAdobe[thisAdobeListName] = adobe.filterUsersToRevoke(
        thisLibCalEmails,
        thisAdobeList
      );

      console.log('adobeList:', thisAdobeListName, thisAdobeList);
      console.log('addToAdobe:', addToAdobe);
      console.log('revokeFromAdobe:', revokeFromAdobe);

      var jsonBody = [];

      if (addToAdobe[thisAdobeListName].length > 0) {
        console.log('Adding to jsonBody to prepare to add to Adobe');
        jsonBody = jsonBody.concat(
          adobe.prepBulkAddFromLibCal2Adobe(
            addToAdobe[thisAdobeListName],
            thisAdobeListName
          )
        );
        console.log('jsonBody:', util.inspect(jsonBody, false, null, false));
      }

      if (revokeFromAdobe[thisAdobeListName].length > 0) {
        console.debug(
          'about to revoke',
          thisAdobeListName,
          'for',
          revokeFromAdobe[thisAdobeListName]
        );
        jsonBody = jsonBody.concat(
          adobe.prepBulkRevokeFromAdobe(
            revokeFromAdobe[thisAdobeListName],
            thisAdobeListName
          )
        );
      }

      if (jsonBody.length > 0) {
        console.debug(
          'Going to submit Json to Adobe:',
          typeof jsonBody,
          util.inspect(jsonBody, false, null, false)
        );
        if (appConf.testMode == true) {
          console.log('TEST MODE: Update not submitted to Adobe');
        } else {
          response = await adobe.callSubmitJson(jsonBody);
          console.log(response);
        }
      } else {
        console.log('No update required; none submitted');
      }
    });
  } catch (err) {
    console.error('Cannot get Adobe list:', err);
  }
  return;
}
