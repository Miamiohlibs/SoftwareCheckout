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
  });

  // it('should be able to get a token', () => {

  // });
});