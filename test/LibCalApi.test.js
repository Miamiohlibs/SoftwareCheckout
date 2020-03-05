const LibCalApi = require('../classes/LibCalApi');
const conf = require('../config/libCal');
const sampleBookings = require('./sample-data/libCalBookingsSample');
// const badConf = conf;
const campusConf = require('../config/campusIT');

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

describe('LibCalApi can get a lists of categories', () => {
  it('should find at least one category', async () => {
    const myApi = new LibCalApi(conf);
    var token = await myApi.getToken();
    var categories = await myApi.getOneLibCalList('categories');
    expect(categories.length).toBeGreaterThan(0);
    var obj = JSON.parse(categories);
    expect(obj[0]).toHaveProperty('lid')
  });
});

describe('LibCalApi can get the booking lists', () => {

  beforeEach( () => {
    myApi = new LibCalApi(conf);
  });

  it('should bring back an array of software and bookings info on getLibCalLists()', async () => {
    await myApi.getToken();
    let bookings = await myApi.getLibCalLists();
    expect(bookings).toBeInstanceOf(Array);
    expect(bookings[0]).toHaveProperty('cid');
    expect(bookings[0]).toHaveProperty('name');
    expect(bookings[0]).toHaveProperty('bookings');
  });

  it('should add a campusCode to each LibCal category', () => {
    let softwareWithCodes = myApi.mapLibCal2CampusCodes(sampleBookings, campusConf.software);
    expect(softwareWithCodes[0]).toHaveProperty('campusCode');
    expect(softwareWithCodes[0].campusCode).toBe('photoshop');
  });

  it('should correctly read a bookings array', () => {
    // let softwareWithCodes = myApi.mapLibCal2CampusCodes(sampleBookings, campusConf.software);
    // let bookingsBrief = myApi.
  });
});

