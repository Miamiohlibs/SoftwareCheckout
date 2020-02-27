const Query = require('../classes/Query');
// const conf = require('../config/libCal.js');
const bogusData = 'Everything you could want';
const genericGet = {
  queryConf: {
    options: {
      hostname: 'randomuser.me',
      port: 443,
      path: '/api', //set at query time
      method: 'GET',
      headers: {
        // set at query time
      }
    }
  }
}

beforeEach(() => {
  setQueryConfMock = jest.fn();
  setAuthMock = jest.fn();
  setDataMock = jest.fn();
});


describe('Query null initialization', () => {
  beforeEach(() => {
    blank = new Query();
  });
  it('should exist with no properties', () => {
    expect(typeof blank).toBe('object');
    expect(blank).not.toHaveProperty('queryConf');
    expect(blank).not.toHaveProperty('auth');
    expect(blank).not.toHaveProperty('data');
  });
});

describe('Query configured initialization', () => {
  beforeEach(() => {
    configured = new Query(genericGet.queryConf);
  });
  it('should be an object with .config, not .data', () => {
    expect(typeof configured).toBe('object');
    // expect(setQueryConfMock).toHaveBeenCalled();
    expect(configured).toHaveProperty('queryConf');
    // expect(typeof configured.config.credentials).toBe('object');
    expect(configured).not.toHaveProperty('auth');
    expect(configured).not.toHaveProperty('data');
  });
});

describe('Query configured initialization with data', () => {
  beforeEach(() => {
    confAndData = new Query(genericGet.queryConf, {}, bogusData);
  });
  it('should be an object with .config, not .data', () => {
    expect(typeof confAndData).toBe('object');
    // expect(setConfMock).not.toHaveBeenCalled();
    expect(confAndData).toHaveProperty('queryConf');
    // expect(typeof configured.config.credentials).toBe('object');
    expect(confAndData).toHaveProperty('auth', {});
    expect(confAndData).toHaveProperty('data', 'Everything you could want');
  });
});

// describe('set config after blank setup', () => {
//   beforeEach(() => {
//     blank = new Query();
//   });

//   it('should take a config setting using setConfigs', () => {
//     blank.setConfigs(conf);
//     expect(blank).toHaveProperty('config');
//     expect(typeof blank.config.credentials).toBe('object');
//     expect(blank).not.toHaveProperty('data');
//   });

//   it('should take a data setting using setData', () => {
//     blank.setData(bogusData);
//     expect(blank).not.toHaveProperty('config');
//     expect(blank).toHaveProperty('data');
//   });
// })