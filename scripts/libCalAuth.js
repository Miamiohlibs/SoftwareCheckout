const libCal = require('../config/libCal');
const oauth2 = require('simple-oauth2').create(libCal.credentials);

module.exports = {
  oauth2: oauth2,
  getToken: function () {
    return new Promise((resolve, revoke) => {
      async function getLibCalToken() {
        try {
          const result = await oauth2.clientCredentials.getToken();
          const accessToken = oauth2.accessToken.create(result);
          //console.log('Token: ', result);
          resolve(result);

        } catch (err) {
          console.error('Access Token Error', err.message);
        }
      }
      getLibCalToken();
    });
  },
  libCalOptions: libCal
}