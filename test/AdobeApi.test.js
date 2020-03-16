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

  it('should add Auth and x-api-key headers using querySetup("generic") with no other arguments', () => {
    var genericOpts = api.queryConf.generic.options;
    // console.log('genericOpts', api.queryConf.generic.options);
    const originalHeadersLength = Object.keys(genericOpts.headers).length;
    api.querySetup('generic');
    expect(api.currOpts).toHaveProperty('headers');
    expect(Object.keys(api.currOpts.headers).length).toEqual(originalHeadersLength + 2);
    expect(api.currOpts.headers).toHaveProperty('x-api-key');
    expect(api.currOpts.headers).toHaveProperty('Authorization');
    let firstWord = api.currOpts.headers.Authorization.split(' ')[0];
    expect(firstWord).toBe('Bearer');
  })

  it('should add Auth and x-api-key headers using querySetup() with extra arguments', () => {
    var genericOpts = api.queryConf.generic.options;
    // console.log('genericOpts', api.queryConf.generic.options);
    const originalHeadersLength = Object.keys(genericOpts.headers).length;
    api.querySetup('generic', { fake: 'aardvark', bogus: 'pangolin' });
    expect(api.currOpts).toHaveProperty('fake', 'aardvark');
    expect(api.currOpts).toHaveProperty('bogus', 'pangolin');
    expect(Object.keys(api.currOpts.headers).length).toEqual(originalHeadersLength + 2);
  })

  it('should be able to add queryConfigs using querySetup() with extra headers', () => {
    var genericOpts = api.queryConf.generic.options;
    console.log('genericOpts', genericOpts)
    const originalHeadersLength = Object.keys(genericOpts.headers).length;
    api.querySetup('generic', { fake: 'aardvark', bogus: 'pangolin', headers: { artificial: 'imaginary' } });
    expect(api.currOpts).toHaveProperty('fake', 'aardvark');
    expect(api.currOpts).toHaveProperty('bogus', 'pangolin');
    expect(api.currOpts.headers).toHaveProperty('artificial', 'imaginary');
    expect(Object.keys(api.currOpts.headers).length).toEqual(originalHeadersLength + 3);
  });
});