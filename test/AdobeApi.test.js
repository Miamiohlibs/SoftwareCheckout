const sampleConf = require('./sample-data/adobeConfSample');
const realConf = require('../config/adobe');
const AdobeUserMgmtApi = require('../classes/AdobeUserMgmtApi');

describe('Initialization', () => {

  beforeEach(() => {
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

describe('Queries', () => {
  beforeEach(async () => {
    api = new AdobeUserMgmtApi(realConf);
    await api.getToken();
  });

  it('should get the access token', () => {
    expect(api).toHaveProperty('accessToken');
    expect(typeof api.accessToken).toBe('string');
  });

  it('should be able to add queryConfigs using querySetup() with extra headers', () => {
    var genericOpts = api.queryConf.generic.options;
    console.log('genericOpts', genericOpts)
    const originalHeadersLength = Object.keys(genericOpts.headers).length;
    api.querySetup('generic', { fake: 'aardvark', bogus: 'pangolin', headers: { artificial: 'imaginary' } });
    expect(api.currOpts).toHaveProperty('fake', 'aardvark');
    expect(api.currOpts).toHaveProperty('bogus', 'pangolin');
    expect(api.currOpts.headers).toHaveProperty('artificial', 'imaginary');
    expect(Object.keys(api.currOpts.headers).length).toEqual(originalHeadersLength + 1);
  })

  it('should be able to add queryConfigs using querySetup() with NO extra headers', () => {
    var genericOpts = api.queryConf.generic.options;
    // console.log('genericOpts', api.queryConf.generic.options);
    const originalHeadersLength = Object.keys(genericOpts.headers).length;
    api.querySetup('generic', { fake: 'aardvark', bogus: 'pangolin' });
    expect(api.currOpts).toHaveProperty('fake', 'aardvark');
    expect(api.currOpts).toHaveProperty('bogus', 'pangolin');
    expect(api.currOpts.headers).not.toHaveProperty('artificial');
    expect(Object.keys(api.currOpts.headers).length).toEqual(originalHeadersLength);
  })

});