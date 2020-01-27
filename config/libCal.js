module.exports = {
  credentials: {
    client: {
      id: '527',
      secret: 'b566c23fdf8afc947a4426394b0ffb02',
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
      json: 'force',
      headers: {
        grant_type: 'client_credentials',
      }
    },
    options: {
      bodyFormat: 'form'
    }
  },
  software: {
    photoshop: {
      cid: 15705,
      name: 'Adobe Photoshop',
      groupName: 'dulb-patronphotoshop'
    }
  },
  queryConfig: {
    options: {
      hostname: 'muohio.libcal.com',
      port: 443,
      path: '', //set at query time
      method: 'GET',
      headers: {
        // set at query time
      }
    },
  }
}