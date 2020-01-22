const https = require('https');

module.exports = function (queryOptions) {
  return new Promise((resolve, reject) => {
    let query = doQuery(queryOptions.options, queryOptions.data);
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

    if (data !== undefined) { req.write(JSON.stringify(data)); }
    req.end();
  });
};

