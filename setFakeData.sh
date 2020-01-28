#!/bin/bash

# run getTokens.sh first, then use the token provided as an argument to this script 

users=("irwinkr" "qum" "bomholmm");
programs=("photoshop" "illustrator");

for p in ${programs[@]}; do 
  for u in ${users[@]}; do 
    curl -X POST https://community.miamioh.edu/directory-accounts/api/members/dulb-patron$p \
      -H 'Accept: application/json' \
      -H "Authorization: $1" \
      -H 'Content-Type: application/json' \
      -d "{
            \"uniqueId\": \"$u\"
        }"
  done
done  
