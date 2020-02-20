module.exports = class LibCalApi  {
  constructor(conf) {
    this.conf = conf;
    const required = ['credentials','queryConfig'];
    required.forEach(element => {
      if (! this.conf.hasOwnProperty(element)) {
        throw new Error('LibCalApi missing required property: '+element);
      }
    });
  }

  async getToken() {
    const oauth2 = require('simple-oauth2').create(this.conf.credentials);
    try {
      const result = await oauth2.clientCredentials.getToken();
      // console.log(oauth2)
      // const accessToken = oauth2.accessToken.create(result);
      // console.log('Token: ', result);
      this.token = result.access_token;
      // console.log('Just token:', this.token)
      return Promise.resolve(this.token);
    } catch (err) {
      console.error('Access Token Error:', err.message);
    }
  }
}