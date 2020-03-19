# Software Checkout

Looks up software bookings from the LibCal API and updates the membership of corresponding Miami ActiveDirectory (AD) groups.

## Requirements

* Node.js 

## Configuration

* config/appConf.js: includes nodePort declaration and a "software" object descibing the connections between LibCal's names for the software and the related Adobe permissions groups
* config/libCal.js: includes API key, config for requesting an API token, and query config for making API requests with the token.
* config/adobe.js: includes API credentials, route to private key, and query config

## Run the app

* `node app` - run once
* `node app --listen` - run once, then listen on port 9000 (or port specified in campusIT.nodePort) for subsequent updates
* PRODUCTION: `npm run server`: will add the `--listen` flag as well as `--name=software-checkout` so we can see which node process it is

### Killing / restarting the app

* run `./killapp` -- finds the relevant process and kills it (only works if you used `npm run server` to start the app
* `./restart` or `./killapp -r`: kill and restart (or use `npm run server` as above)

## Log files

* `./lastlog.sh`: displays the output of the last update (from `logs/app.log`)
* `logs/app.log`: logs console/STDOUT and STDERR when the app runs (chiefly at startup and whenever someone hits ths url)
* `bookings.log`: most recent copy of the bookings API call from LibCal
* `categories.log`: most recent copy of the categories API call from LibCal
* `locations.log`: most recent copy of the locations API call from LibCal




