// this is the OOP version of app.js, in progress
const Query = require('./classes/Query');
const LibCalApi = require('./classes/LibCalApi');
const libCalConf = require('./config/libCal');
const CampusApi = require('./classes/CampusApi');
const campusConf = require('./config/campusIT');
const adobeConf = require('./config/adobe');
const AdobeApi = require('./classes/AdobeUserMgmtApi');
const fs = require('fs');
const async = require('async');

// comment this line out to suppress debug messages
// console.debug = ()=>{};

(async () => {
  const startTime = new Date().getTime();

  // Get LibCal Token
  try {
    lcApi = new LibCalApi(libCalConf);
    const lcToken = await lcApi.getToken();
    console.debug('LibCal token:', lcToken)
  } catch {
    console.error('Unable to get LibCal Token');
  }

  // Get CampusToken
  try {
    campusApi = new CampusApi(campusConf);
    const campusToken = await campusApi.getToken();
    console.debug('Campus token:', campusToken);
  } catch {
    console.error('Unable to get Campus Token');
  }

  // get Adobe Token
  const adobe = new AdobeApi(adobeConf);
  try {
    await adobe.getToken();
    console.log('Adobe token:', adobe.accessToken);
  } catch (err) {
    console.error('Unable to get Adobe token:', err)
  }

  // Get Campus Lists
  try {
    let campusLists = await campusApi.getMultipleLists();
    console.debug(campusLists);
  } catch (err) {
    console.error('Error getting campus lists:', err);
  }

  // Get LibCal Lists
  let lcUserList = {};
  try {
    let lcSoftware = await lcApi.getLibCalLists();
    lcSoftware = lcApi.mapLibCal2CampusCodes(lcSoftware, campusConf.software);
    console.debug(JSON.stringify(lcSoftware, null, 4));
    // lcBookings = lcApi.getCurrentLibCalBookings(lcSoftware);


    await async.eachOf(lcSoftware, async software => {
      let lcBookings = lcApi.getCurrentLibCalBookings(software.bookings)
      console.log(lcBookings)
      // let emailBookings = lcApi.getEmailsFromBookings(lcBookings);
      // console.log('Email bookings', emailBookings);
      lcUserList[software.campusCode] = lcBookings; // await campusApi.convertMultipleEmails(emailBookings);
      // console.log('userlist:', software.campusCode, lcUserList[software.campusCode]);
    });

    console.log('LibCal bookings:', lcUserList);
  } catch (err) {
    console.error('Error getting LibCal lists:', err);
  }


  // get Adobe user lists
  let adobeUserList = {};
  let addToAdobe = {};
  let revokeFromAdobe = {};
  try {
    const adobeGroups = [{ groupName: 'library patron api test', libCalList: 'photoshop' }];

    await async.eachOf(adobeGroups, async list => {
      let response = await adobe.callGroupUsers(list.groupName);
      adobeUserList[list.groupName] = adobe.getCurrentUsernames(JSON.parse(response));

      // filter libcal response to determine what needs to be added to adobe:
      var thisLibCalListName = list.libCalList;
      var thisAdobeListName = list.groupName;
      var thisLibCalList = lcUserList[thisLibCalListName];
      var thisLibCalEmails = lcApi.getEmailsFromBookings(thisLibCalList);
      var thisAdobeList = adobeUserList[thisAdobeListName];
      console.log(thisLibCalListName, '(libcal):', thisLibCalList.length);
      console.log(thisAdobeListName, '(adobe)', thisAdobeList.length);

      addToAdobe[thisAdobeListName] = adobe.filterBookingsToAdd(thisLibCalList, thisAdobeList);
      revokeFromAdobe[thisAdobeListName] = adobe.filterUsersToRevoke(thisLibCalEmails, thisAdobeList);

      console.log('adobeList:', thisAdobeListName, thisAdobeList);
      console.log('addToAdobe:', addToAdobe);
      console.log('revokeFromAdobe:', revokeFromAdobe);

     var jsonBody = [];

      if (addToAdobe[thisAdobeListName].length > 0) {
        // let jsonBody = JSON.stringify(adobe.prepBulkAddFromLibCal2Adobe(addToAdobe[thisAdobeListName], thisAdobeListName));
         jsonBody = jsonBody.concat(adobe.prepBulkAddFromLibCal2Adobe(addToAdobe[thisAdobeListName], thisAdobeListName));
      }

      // console.log(JSON.stringify(jsonBody, null, 4));

        if (revokeFromAdobe.length > 0) {
          // jsonBody.push(adobe)
        }

      if (jsonBody != []) {
        // let json = JSON.parse(jsonBody);
        response = await adobe.callSubmitJson(jsonBody);
        console.log(response);
      } else {
        console.log('No update required; none submitted');
      }
    });

    // console.log('Add Adobe Users:', addToAdobe);
  } catch (err) {
    console.error('Cannot get Adobe list:', err);
  }


})();
