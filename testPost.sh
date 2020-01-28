#!/bin/bash

# run getTokens.sh first, then use the token provided as an argument to this script 

curl -X POST \
  https://community.miamioh.edu/directory-accounts/api/members/dulb-patronadobecc \
  -H 'Accept: application/json' \
  -H "Authorization: $1" \
  -H 'Content-Type: application/json' \
  -d '{
        "uniqueId": "bomholmm"
    }'

