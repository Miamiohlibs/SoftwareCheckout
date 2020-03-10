const jwt = require('jsonwebtoken');
const moment = require('moment');

module.exports = class AdobeUserMgmtApi {
  constructor (conf) {
    this.conf = conf;
  } 

  readConf (key) {
    return this.conf.values.filter(item => { return item.key == key })[0].value;
  }

  getJWT () {
    const aud = this.readConf('API_KEY');
    const iss = this.readConf('IMS_ORG');
    const sub = this.readConf('TECHNICAL_ACCOUNT_ID');
    const exp = parseInt(moment().add(15, 'minutes').format('X'));
    const secret  = this.readConf('CLIENT_SECRET');
    
    const payload = {
      exp: exp,
      iss: iss,
      sub: sub,
      "https://ims-na1.adobelogin.com/s/meta_scope": true,
      aud: aud
    }
    
    let token = jwt.sign(payload,secret);
    return token;
  }
 }