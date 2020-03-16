const sampleConf = require('./sample-data/adobeConfSample');
const realConf = require('../config/adobe');
const AdobeUserMgmtApi = require('../classes/AdobeUserMgmtApi');
const sampleGroupMembers = require('./sample-data/adobeGroupMembers');

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

describe('getActionPath', () => {
  beforeEach(async () => {
    api = new AdobeUserMgmtApi(realConf);
  });
  it('should return a valid path with just an action argument', () => {
    let response = api.getActionPath('users');
    let expected = expect.stringMatching(/^\/v2\/usermanagement\/users\/.*@AdobeOrg\/0\?/);
    expect(response).toEqual(expected);
  });

  it('should return a valid path with args: action, argument', () => {
    let response = api.getActionPath('users','myarg');
    let expected = expect.stringMatching(/^\/v2\/usermanagement\/users\/.*@AdobeOrg\/0\/myarg\?/);
    expect(response).toEqual(expected);
  });

  it('should return a valid path with args: action, argument, page', () => {
    let response = api.getActionPath('users','myarg',2);
    let expected = expect.stringMatching(/^\/v2\/usermanagement\/users\/.*@AdobeOrg\/2\/myarg\?/);
    expect(response).toEqual(expected);
  });

  it('should return a valid path with args: action, null, page', () => {
    let response = api.getActionPath('users',null,2);
    let expected = expect.stringMatching(/^\/v2\/usermanagement\/users\/.*@AdobeOrg\/2\?/);
    expect(response).toEqual(expected);
  });

  it('should return a valid path with args: action, argument, null', () => {
    let response = api.getActionPath('users','myarg',null);
    let expected = expect.stringMatching(/^\/v2\/usermanagement\/users\/.*@AdobeOrg\/0\/myarg\?/);
    expect(response).toEqual(expected);
  });

  it('should not paginate where action == action', () => {
    let response = api.getActionPath('action');
    let expected = expect.stringMatching(/^\/v2\/usermanagement\/action\/.*@AdobeOrg\/\?/);
    expect(response).toEqual(expected);
  });

  it('should throw an error with no args', () => {
    function noArgs () {
      api.getActionPath();
    }
    expect(noArgs).toThrowError(Error);
  });

  it('should return an error with non-integer page arg', () => {
    function hamsterMany () {
      api.getActionPath('generic',null,'hamster');
    }
    expect(hamsterMany).toThrowError(Error);
  });
});

describe('getCurrentUsernames', () => {
  beforeEach(async () => {
    api = new AdobeUserMgmtApi(realConf);
    await api.getToken();
  });
  it('should just get one username back', () => { 
    response = api.getCurrentUsernames(sampleGroupMembers);
    expect(response).toBeInstanceOf(Array);
    expect(response.length).toBe(1);
    expect(response[0]).toBe('irwinkr');
  });
});