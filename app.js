const {oauth2, getToken} = require('./config/auth');

getToken().then(values => {
  const token = values.access_token;

})







