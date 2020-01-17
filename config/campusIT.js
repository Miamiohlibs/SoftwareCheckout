const https = require('https');
const querystring = require('querystring');

module.exports = function () {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      username: 'ulbuser',
      password: 'x7EH0*n0D^YL',
      type: 'usernamePassword'
    });

    const options = {
      hostname: 'ws.apps.miamioh.edu',
      port: 443,
      path: '/api/authentication/v1',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }
    let query = doQuery(options, data);
    resolve(query);
  })
}
async function doQuery(options, data) {
  return await doRequest(options, data);
}

function doRequest(options, data) {
  return new Promise((resolve, reject) => {

    console.log('doRequest options: ', options)
    const req = https.request(options, (res) => {
      res.setEncoding('utf8');
      let responseBody = '';

      res.on('data', (chunk) => {
        responseBody += chunk;
      });

      res.on('end', () => {
        resolve(responseBody);
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data !== undefined) { req.write(data); }
    req.end();



  });
};
