const Query = require('../classes/Query');
const conf = require('../config/libCal.js');
const bogusData = 'Everything you could want';

// const badConf = conf;

beforeEach(() => {
  setConfMock = jest.fn();
  setDataMock = jest.fn();
});


describe('Query null initialization', () => {
  beforeEach(() => {
    blank = new Query();
  });
  it('should exist with no properties', () => {
    expect(typeof blank).toBe('object');
    expect(setConfMock).not.toHaveBeenCalled();
    expect(setDataMock).not.toHaveBeenCalled();
  });
});

describe('Query configured initialization', () => {
  beforeEach(() => {
    configured = new Query(conf);
  });
  it('should be an object with .config, not .data', () => {
    expect(typeof configured).toBe('object');
    expect(setConfMock).not.toHaveBeenCalled();
    expect(configured).toHaveProperty('config');
    expect(typeof configured.config.credentials).toBe('object');
    expect(configured).not.toHaveProperty('data');
  });
});

describe('Query configured initialization with data', () => {
  beforeEach(() => {
    configured = new Query(conf, bogusData);
  });
  it('should be an object with .config, not .data', () => {
    expect(typeof configured).toBe('object');
    expect(setConfMock).not.toHaveBeenCalled();
    expect(configured).toHaveProperty('config');
    expect(typeof configured.config.credentials).toBe('object');
    expect(configured).toHaveProperty('data', 'Everything you could want');
  });
});

describe('set config after blank setup', () => {
  beforeEach(() => {
    blank = new Query();
  });

  it('should take a config setting using setConfigs', () => {
    blank.setConfigs(conf);
    expect(blank).toHaveProperty('config');
    expect(typeof blank.config.credentials).toBe('object');
    expect(blank).not.toHaveProperty('data');
  });

  it('should take a data setting using setData', () => {
    blank.setData(bogusData);
    expect(blank).not.toHaveProperty('config');
    expect(blank).toHaveProperty('data');
  });
})