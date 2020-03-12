const sampleConf = require('./sample-data/adobeConfSample');
const realConf = require('../config/adobe');
const AdobeUserMgmtApi = require('../classes/AdobeUserMgmtApi');

describe('Initialization', () => {

  beforeEach( () => {
    api = new AdobeUserMgmtApi(realConf);
  });

  it('should initialize with a conf file', () => {
    expect(typeof api.credentials).toBe('object');
    expect(api.credentials).toHaveProperty('clientId');
  });

  it('should be able to read the private key', () => {
    expect(api.credentials).toHaveProperty('privateKey');
    expect(typeof api.credentials.privateKey).toBe('string');
  });
})

describe('getToken', () => {

  beforeEach(async () => {
    api = new AdobeUserMgmtApi(realConf);
    await api.getToken();
  });

  it('should get the access token', () => { 
    expect(api).toHaveProperty('accessToken');
    expect(typeof api.accessToken).toBe('string');
  });
});