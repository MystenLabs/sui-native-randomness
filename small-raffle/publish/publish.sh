#!/bin/bash

# check dependencies are available.
for i in jq curl sui; do
  if ! command -V ${i} 2>/dev/null; then
    echo "${i} is not installed"
    exit 1
  fi
done

FULLNODE=https://fullnode.devnet.sui.io:443

echo "- Admin Address is: ${ADMIN_ADDRESS}"

import_address=$(sui keytool import "$ADMIN_PHRASE" ed25519)

switch_res=$(sui client switch --address ${ADMIN_ADDRESS})

ACTIVE_ADMIN_ADDRESS=$(sui client active-address)
echo "Admin address used for publishing: ${ACTIVE_ADMIN_ADDRESS}"
ACTIVE_NETWORK=$(sui client active-env)
echo "Environment used is: ${ACTIVE_NETWORK}"

publish_res=$(sui client publish --gas-budget 2000000000 --json ../small_raffle/)

echo ${publish_res} >.publish.res.json

# Check if the command succeeded (exit status 0)
if [[ "$publish_res" =~ "error" ]]; then
  # If yes, print the error message and exit the script
  echo "Error during move contract publishing.  Details : $publish_res"
  exit 1
fi

PACKAGE_ID=$(echo "${publish_res}" | jq -r '.effects.created[] | select(.owner == "Immutable").reference.objectId')

newObjs=$(echo "$publish_res" | jq -r '.objectChanges[] | select(.type == "created")')

PUBLISHER_ID=$(echo "$newObjs" | jq -r 'select (.objectType | contains("package::Publisher")).objectId')

UPGRADE_CAP_ID=$(echo "$newObjs" | jq -r 'select (.objectType | contains("package::UpgradeCap")).objectId')

cat >../small-raffle/.env<<-ENV
FULLNODE=$FULLNODE
ADMIN_ADDRESS=$ACTIVE_ADMIN_ADDRESS
ADMIN_PHRASE=$ADMIN_PHRASE
UPGRADE_CAP_ID=$UPGRADE_CAP_ID
PACKAGE_ID=$PACKAGE_ID
ENV

echo "Small Raffle Contracts Deployment finished!"

# sui keytool import "file already exercise jealous shallow coconut amazing found skirt mail food gauge" ed25519
# sui client switch --address 0x23f5f16c179f11117465e139fd5dc7d7a56367c605eec48b43404b8cdda3a8a7
# export ADMIN_PHRASE="file already exercise jealous shallow coconut amazing found skirt mail food gauge"
# export ADMIN_ADDRESS="0x23f5f16c179f11117465e139fd5dc7d7a56367c605eec48b43404b8cdda3a8a7"