# Software Checkout

Looks up software bookings from the LibCal API and updates the membership of corresponding Miami ActiveDirectory (AD) groups.

## Requirements

* Node.js 

## Configuration

* config/libCal.js: includes API key, config for requesting an API token, and query config for making API requests with the token.
* config/campusIT.js: includes list of software, config for requesting the AD API token, and query configs CRUD API requests to ActiveDirectory.

## Run the app

* `node app` - run once
* `node app --listen` - run once, then listen on port 9000 (or port specified in campusIT.nodePort) for subsequent updates
* let's use `npm run server` in production: it will add the `--listen` flag as well as `--name=software-checkout` so we can see which node process it is

## Helper files (not part of the app): 

* data.json: contains credentials for campus authentication
* getToken.sh: run this on the commmand line to get a campus token (uses data.json for auth)
* setFakeData.sh: run this on the command like with a token as a sole argument to re-populate campus lists with some people
* testPost.sh: add name to one list for one group
* fetchCC: get the AD list for one group
* notes.txt: Dirk's notes documenting the campus AD API

