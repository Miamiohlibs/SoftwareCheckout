const CampusApi = require('../classes/CampusApi');
const campusConf = require('../config/campusIT');

describe('Campus IT API', () => {

  beforeEach(() => {
    api = new CampusApi(campusConf);
  });

  it('should read the config file on initialization', () => {
    expect(typeof api).toBe('object');
    expect(api.conf).toHaveProperty('connectConfig');
    expect(api.conf).toHaveProperty('software');
    expect(api).toHaveProperty('campusListNames'); // should this be mocked to just calls getCampusListNames ?
  });

  it('should be able to get a token', async () => {
    const token = await api.getToken();
    expect(typeof api.token).toBe('string');
    expect(api.token.length).toBeGreaterThan(10);
    expect(token).toEqual(api.token);
  });

  it('should get the list of campus IT software items', () => {
    let lists = api.getCampusListNames();
    expect(lists).toBeInstanceOf(Array);
    expect(lists).toContain('adobecc');
    expect(lists).toEqual(api.campusListNames);
  });

  it('should use getOneList to get the contents of a single list', async () => {
    const token = await api.getToken();
    let values = await api.getOneList('adobecc');
    expect(values).toBeInstanceOf(Array);
  })


  // it('should use get the lists', () => {
  //   let listObj = api.getListValues();
  //   expect(typeof listObj).toBe('object');
  //   expect(listObj).toHaveProperty('adobecc');
  //   expect(listObj.adobecc).toBeInstanceOf(Array);
  // })
});