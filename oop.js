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
    console.log('Adobe token:',adobe.accessToken);
  } catch (err) {
    console.error('Unable to get Adobe token:',err)
  }

  // Get Campus Lists
  try {
    let campusLists = await campusApi.getMultipleLists();
    console.debug(campusLists);
  } catch (err) {
    console.error('Error getting campus lists:', err);
  }

  // Get LibCal Lists
  try {
    let lcSoftware = await lcApi.getLibCalLists();
    lcSoftware = lcApi.mapLibCal2CampusCodes(lcSoftware, campusConf.software);
    console.debug(JSON.stringify(lcSoftware, null, 4));
    // lcBookings = lcApi.getCurrentLibCalBookings(lcSoftware);
    let lcUserList = {};

    await async.eachOf(lcSoftware, async software => {
      let lcBookings = lcApi.getCurrentLibCalBookings(software.bookings)
      let emailBookings = lcApi.getEmailsFromBookings(lcBookings);
      // console.log('Email bookings', emailBookings);
      lcUserList[software.campusCode] = await campusApi.convertMultipleEmails(emailBookings);
      // console.log('userlist:', software.campusCode, lcUserList[software.campusCode]);
    });

    console.log('LibCal bookings:', lcUserList);
  } catch (err) {
    console.error('Error getting LibCal lists:', err);
  }


  // get Adobe user lists
  let adobeUserList = {};

  try { 
    const adobeGroups = [{ groupName: 'library patron api test', campusList: 'bogusList'}];
   
    await async.eachOf(adobeGroups, async list => {
      let response = await adobe.callGroupUsers(list.groupName);
      adobeUserList[list.groupName] = adobe.getCurrentUsernames(JSON.parse(response));
    });
    console.log('Adobe Users:', adobeUserList);
  } catch (err) { 
    console.error('Cannot get Adobe list:', err);
  }

  
})();
