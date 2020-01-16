const https = require('https');
const querystring = require('querystring');

const postData = querystring.stringify({
  client_id: '527',
  client_secret: 'b566c23fdf8afc947a4426394b0ffb02',
  grant_type: 'client_credentials'
})

const options = {
  hostname: 'muohio.libcal.com',
  port: 443,
  path: '/1.1/oauth/token',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': postData.length,
    clientID: '527',
    clientSecret: 'b566c23fdf8afc947a4426394b0ffb02',
    grant_type: 'client_credentials'
  }
}
async function getToken(options, postData) {
  const req = https.request(options, async (res) => {
    console.log('statusCode:', res.statusCode);
    console.log('headers:', res.headers);

    const auth = res.on('data', (d) => {
      process.stdout.write(d);
      const auth = JSON.parse(d);
      return auth;
    });
  });
  req.on('error', (e) => {
    console.error(e);
  });

  req.write(postData);
  req.end();
  return auth;
}

const auth = getToken(options, postData);
module.exports = auth;

/*
const ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;


passport.use(new ClientPasswordStrategy(
  function(clientId, clientSecret, done) {
  Clients.findOne({ clientId: clientId }, function (err, client) {
    if (err) { return done(err); }
    if (!client) { return done(null, false); }
    if (client.clientSecret != clientSecret) { return done(null, false); }
    return done(null, client);
  });
}
));
*/