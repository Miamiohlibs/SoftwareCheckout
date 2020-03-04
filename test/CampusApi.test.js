const CampusApi = require('../classes/CampusApi');
const campusConf = require('../config/campusIT');
const sampleCampusListJson = '[{"uniqueId":"yarnete","affiliationCode":"sta","directories":{"Database":"member","GoogleApps":"member","ActiveDirectory":"member"}},{"uniqueId":"irwinkr","affiliationCode":"sta","directories":{"Database":"member","GoogleApps":"member","ActiveDirectory":"member"}}]';


describe('Campus IT API', () => {

  beforeEach(() => {
    api = new CampusApi(campusConf);
    jest.setTimeout(30000);
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


  it('should use justUniqueIds to get an array of users', () => {
    obj = JSON.parse(sampleCampusListJson);    
    // console.log(obj)
    var arr = api.justUniqueIds(obj);
    expect(arr).toBeInstanceOf(Array);
    expect(arr.length).toEqual(obj.length);
    expect(typeof arr[0]).toBe('string');
    expect(arr[0]).toBe('yarnete');
  });

  it('should use get multiple lists', async () => {
    try {
      let listObj = await api.getMultipleLists();
      expect(typeof listObj).toBe('object');
      expect(listObj).toHaveProperty('adobecc');
      expect(listObj).toHaveProperty('photoshop');
      expect(listObj.adobecc).toBeInstanceOf(Array);
      expect(listObj.photoshop).toBeInstanceOf(Array);
    } catch (err) { 
      console.log(err)
    }
  })

  it('should be able to convert an email alias to a Miami uniqueId', async () => {
    try { 
      let alias = 'jerry.yarnetsky@miamioh.edu';
      let uniq = await api.convertEmailToUniq(alias);
      expect(uniq).toBe('yarnete');
    } catch (err) {
      console.error(err);
      expect(true).toBe(false);
    }
  });
});