#!/bin/bash

UUID=$1
FILE=$2
GROUP=$3
DIR=$4

cd $DIR
belenios-tool credgen --uuid $UUID --group $GROUP --file $FILE --dir $DIR
mv ./*.pubcreds ./public_creds.txt
mv ./*.privcreds ./private_creds.txt
belenios-tool trustee-keygen --group $GROUP
mv ./*.pubkey ./public_keys.jsons
mv ./*.privkey ./private_keys.jsons
belenios-tool mktrustees --dir $DIR
rm -f public_keys.jsons
