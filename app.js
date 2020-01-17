//const token = require('./config/auth');
//console.log('Recieved token: ', token);

const libCal = require('./config/libCal');
const oauth2 = require('simple-oauth2').create(libCal.credentials);

const token = new Promise((resolve, revoke) => {
  async function getToken() {
    try {
      const result = await oauth2.clientCredentials.getToken();
      const accessToken = oauth2.accessToken.create(result);
      //console.log('Token: ', result);
      resolve(result);

    } catch (err) {
      console.error('Access Token Error', err.message);
    }
  }
  getToken();
});

Promise.all([token]).then(values => console.log(values))







