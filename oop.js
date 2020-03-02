// this is the OOP version of app.js, in progress
const Query = require('./classes/Query');
const LibCalApi = require('./classes/LibCalApi');
const libCalConf = require('./config/libCal');

(async () => { 
  const startTime = new Date().getTime();

  try {
    lcApi = new LibCalApi(libCalConf);
    lcToken = await lcApi.getToken();
    console.log('LibCal token:', lcToken)
  } catch {
    console.error('Unable to get LibCal Token');
  }

})();
