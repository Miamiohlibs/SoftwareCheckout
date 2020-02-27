const https = require('https');

module.exports = class Query {
  constructor ( queryConf = null , auth = null, data = null ) {
    if (queryConf !== null ) { this.setQueryConf(queryConf); }
    if (auth !== null) { this.setAuth(auth); }
    if (data !== null ) { this.setData(data); }
  }

  setQueryConf(configs) {
    this.queryConf = configs;
  }

  setAuth(auth) {
    this.auth = auth;
  }

  setData(data) {
    this.data = data;
  }

  execute() {
    return new Promise((resolve, reject) => {
        // console.log('doRequest options: ', options)
      const req = https.request(this.queryConf.options, (res) => {
        // console.log(options);
        res.setEncoding('utf8');
        let responseBody = '';
  
        res.on('data', (chunk) => {
          responseBody += chunk;
        });
  
        res.on('end', () => {
          // console.log('RESPONSE: ', responseBody)
          resolve(responseBody);
        });
      });
  
      req.on('error', (err) => {
        reject(err);
      });
  
      if (this.data !== undefined) {
        req.write(JSON.stringify(this.data));
      }
      req.end();
    });
  };

}