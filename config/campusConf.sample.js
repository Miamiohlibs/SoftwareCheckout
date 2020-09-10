module.exports = {
  emailDomain: '', // e.g. '@wherever.edu'
  queryConf: {
    convert: {
      // configure api to convert email aliases if you campus has one
      options: {
        hostname: '', // e.g. 'apiserver.youruniversity.edu'
        port: 443,
        pathStem: '', // e.g. '/path/to/convert/api/?query='
        // path: configure at query time
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      },
    },
  },
};
