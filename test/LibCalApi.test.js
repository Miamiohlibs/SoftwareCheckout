const LibCalApi = require('../classes/LibCalApi');
const conf = require('../config/libCal');
const badConf = conf;

describe('LibCalApi initialization', () => {
  it('should have some basic variables set on initialization', () => {
    const myApi = new LibCalApi(conf);
    expect(myApi).toHaveProperty('conf');
  })

  // it('should throw an error if missing some basic properties', () => {
  //   const myApi = new LibCalApi({});
  //   expect(new LibCalApi({})).toThrowError()
  // })
})

describe('LibCalApi gets token', () => {
  it('should get an access token', async () => {
    const myApi = new LibCalApi(conf);
    token = await myApi.getToken();
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(10);
  })
})

describe('LibCalApi can get a list of categories', () => {
  it('should find at least one category', async () => {
    const myApi = new LibCalApi(conf);
    var token = await myApi.getToken();
    var categories = await myApi.getOneLibCalList('categories');
    expect(categories.length).toBeGreaterThan(0);
    var obj = JSON.parse(categories);
    expect(obj[0]).toHaveProperty('lid')
  });
})