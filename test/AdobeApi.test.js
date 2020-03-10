const sampleConf = require('./sample-data/adobeConfSample');
const AdobeUserMgmtApi = require('../classes/AdobeUserMgmtApi');

describe('Initialization', () => {
  it('should initialize with a conf file', () => {
    const api = new AdobeUserMgmtApi(sampleConf);
    expect(api.conf.values[0].key).toBe('CLIENT_SECRET');
    expect(api.conf.values[0].value).toBe('my_client_secret');
  });
})

describe('ReadConf', () => {
  it('should correctly read values based on keys in the config file', () => {
    const api = new AdobeUserMgmtApi(sampleConf);
    const clientSecret = api.readConf('CLIENT_SECRET');
    const apiKey = api.readConf('API_KEY');
    expect(clientSecret).toBe('my_client_secret');
    expect(apiKey).toBe('my_api_key');
  })
});