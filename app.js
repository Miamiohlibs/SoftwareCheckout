const express = require('express');
// const passport = require('passport');
const app = express();
//const token = require('./config/auth');
//console.log('Recieved token: ', token);

const credentials = {
  client: {
    id: '230',
    secret: '2a776c14a7bf130b46295f4ac41173cb',
    secretParamName: 'client_secret',
    idParamName: 'client_id'
  },
  auth: {
    tokenHost: 'https://muohio.libcal.com',
    tokenPath: '/1.1/oauth/token',
    revokePath: '/1.1/oauth/revoke',
    authorizeHost: 'https://muohio.libcal.com',
    authorizePath: '/1.1/oauth/token'
  },
  http: {
    headers: {
      grant_type: 'client_credentials',
    }
  },
  options: {
    bodyFormat: 'form'
  }
}

const oauth2 = require('simple-oauth2').create(credentials);

const tokenConfig = {

};
const httpOptions = {
  headers: {
    grant_type: 'client_credentials',
  }
}
app.get('/callback', async (req,res) => {
  const options = { }
  try {
    const result = await oauth2.authorizationCode.getToken();
    const accessToken = oauth2.accessToken.create(result);
    console.log('Token: ', result);
  
  } catch (err) {
    console.error('Access Token Error', err.message);
  }
  
})




const PORT = process.env.PORT || 1000;
app.listen(PORT, () => console.log(`Software Checkout started on port ${PORT}`));