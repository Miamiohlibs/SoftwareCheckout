// this is the OOP version of app.js, in progress
const Query = require('./classes/Query');
const LibCalApi = require('./classes/LibCalApi');
const libCalConf = require('./config/libCal');
const CampusApi = require('./classes/CampusApi');
const campusConf = require('./config/campusIT');

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
    lcSoftware = lcApi.mapLibCal2CampusCodes(lcSoftware, campusConf.software)
    console.debug(JSON.stringify(lcSoftware, null, 4));
  } catch (err) {
    console.error('Error getting LibCal lists:', err);
  }

})();
