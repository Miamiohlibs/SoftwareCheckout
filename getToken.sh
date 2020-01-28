#!/bin/sh
curl -X POST -H 'Content-Type: application/json' -H 'Accept: application/json' -d "@data.json" https://ws.apps.miamioh.edu/api/authentication/v1
