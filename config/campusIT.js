module.exports = {
  software: [
    {
      name: 'Adobe Photoshop',
      shortName: 'photoshop'
    },
    {
      name: 'Adobe Illustrator',
      shortName: 'illustrator'
    }
  ],
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
    get: {
      options: {
        hostname: 'community.miamioh.edu',
        port: 443,
        pathStem: '/directory-accounts/api/members/',
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      }
    },
    post: {
      options: {
        hostname: 'community.miamioh.edu',
        port: 443,
        pathStem: '/directory-accounts/api/members/',
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    },
    delete: {
      options: {
        hostname: 'community.miamioh.edu',
        port: 443,
        pathStem: '/directory-accounts/api/members/',
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    }
  }

}

