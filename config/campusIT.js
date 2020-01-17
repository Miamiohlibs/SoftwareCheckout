module.exports = {
  connectConfig: {
    options: {
      hostname: 'ws.apps.miamioh.edu',
      port: 443,
      path: '/api/authentication/v1',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    },
    data: {
      username: 'ulbuser',
      password: 'x7EH0*n0D^YL',
      type: 'usernamePassword'
    }
  },
  queryConfig: {
    options: {

    },
    data: {

    }
  }
}

