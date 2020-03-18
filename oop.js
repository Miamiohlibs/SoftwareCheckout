// this is the OOP version of app.js, in progress
const LibCalApi = require('./classes/LibCalApi');
const libCalConf = require('./config/libCal');
const appConf = require('./config/appConf');
const adobeConf = require('./config/adobe');
const AdobeApi = require('./classes/AdobeUserMgmtApi');
const async = require('async');

// uncomment this line to suppress debug messages
console.debug = ()=>{};

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

  // get Adobe Token
  const adobe = new AdobeApi(adobeConf);
  try {
    await adobe.getToken();
    console.debug('Adobe token:', adobe.accessToken);
  } catch (err) {
    console.error('Unable to get Adobe token:', err)
  }

  // Get LibCal Lists
  let lcUserList = {};
  try {
    let lcSoftware = await lcApi.getLibCalLists();
    lcSoftware = lcApi.mapLibCal2ShortName(lcSoftware, appConf.software);
    console.debug(JSON.stringify(lcSoftware, null, 4));

    await async.eachOf(lcSoftware, async software => {
      if (software.bookings.length > 0) { 
        let lcBookings = lcApi.getCurrentLibCalBookings(software.bookings)
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
    // const adobeGroups = [{ groupName: 'library patron api test', libCalList: 'photoshop' }]; 
    const adobeGroups = appConf.software.filter(item => item.provider == 'Adobe');

    await async.eachOf(adobeGroups, async list => {
      let response = await adobe.callGroupUsers(list.adobeGroupName);
      if (JSON.parse(response).hasOwnProperty('result')) {
        console.log('Error reading Adobe group in:', list);
        console.log('One or more needed values may not be set');
      }
      // console.debug('list for:',list.adobeGroupName);
      adobeUserList[list.adobeGroupName] = adobe.getCurrentUsernames(JSON.parse(response));

      // filter libcal response to determine what needs to be added to adobe:
      var thisLibCalListName = list.shortName;
      var thisAdobeListName = list.adobeGroupName;
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
         jsonBody = jsonBody.concat(adobe.prepBulkAddFromLibCal2Adobe(addToAdobe[thisAdobeListName], thisAdobeListName));
      }

      if (revokeFromAdobe[thisAdobeListName].length > 0) {
        console.debug('about to revoke',thisAdobeListName,'for',revokeFromAdobe[thisAdobeListName])
        jsonBody = jsonBody.concat(adobe.prepBulkRevokeFromAdobe(revokeFromAdobe[thisAdobeListName], thisAdobeListName));
      }

      if (jsonBody.length > 0) {
        console.debug('Going to submit Json to Adobe:', typeof jsonBody, jsonBody);
        response = await adobe.callSubmitJson(jsonBody);
        console.log(response);
      } else {
        console.log('No update required; none submitted');
      }
    });
  } catch (err) {
    console.error('Cannot get Adobe list:', err);
  }


})();
