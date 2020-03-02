const Query = require('../classes/Query');
const libCalConf = require('../config/libCal.js');
const bogusData = 'Everything you could want';
const genericGet = {
  queryConf: {
    options: {
      hostname: 'jsonlint.com',
      port: 443,
      path: '/', //set at query time
      method: 'GET',
      headers: {
        // set at query time
      }
    }
  }
}
const genericJSON = {
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
const postJSON = {
  queryConf: {
    options: {
      hostname: 'ulblwebt03.lib.miamioh.edu',
      port: 443,
      path: '/~irwinkr/json_in_json_out.php', //set at query time
      method: 'POST',
      headers: {
        'Content-type': 'application/json'
      }
    }
  }
}

const postData = { 'in': 'garbage' }

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

describe('set config after blank setup', () => {
  beforeEach(() => {
    incremental = new Query();
  });

  it('should take a config setting using setQueryConf', () => {
    incremental.setQueryConf(genericGet.queryConf);
    expect(incremental).toHaveProperty('queryConf');
    expect(typeof incremental.queryConf).toBe('object');
    expect(incremental).not.toHaveProperty('auth');
    expect(incremental).not.toHaveProperty('data');
  });

  it('should take a data setting using setAuth', () => {
    incremental.setAuth({test:'authorization'});
    expect(incremental).not.toHaveProperty('queryConf');
    expect(incremental).toHaveProperty('auth');
    expect(incremental).not.toHaveProperty('data');
  });

  it('should take a data setting using setData', () => {
    incremental.setData(bogusData);
    expect(incremental).not.toHaveProperty('queryConf');
    expect(incremental).toHaveProperty('data');
  });
});

// Usually keep this commented out so we don't hit the randomuser.me site every time we test 
// describe('query execution (generic, unauthenticated)', () => { 
//   beforeEach(() => {
//     api = new Query(genericJSON.queryConf);
//   });
//   it('should return a JSON object', async () => {
//     const q = await api.execute();
//     const obj = await JSON.parse(q); 
//     expect(typeof q).toBe('string');
//     expect(typeof obj).toBe('object');
//     expect(obj).toHaveProperty('info');
//     expect(obj).toHaveProperty('results');
//   })
// });

describe('query execution with post variables', () => { 
  beforeEach(() => {
    api = new Query(postJSON.queryConf, null, postData);
  });
  it('should return a JSON object with ', async () => {
    const q = await api.execute();
    console.log(q)
    const obj = await JSON.parse(q); 
    expect(typeof q).toBe('string');
    expect(typeof obj).toBe('object'); 
    expect(obj).toHaveProperty('out','garbage');
  })
});