#!/bin/bash

belenios-tool () {
  dependencies/belenios/_build/install/default/bin/belenios-tool "$@"
}

UUID=$1
FILE=$2
GROUP=$3
DIR=$4

belenios-tool credgen --uuid $UUID --group $GROUP --file $FILE --dir $DIR
mv $DIR/*.pubcreds $DIR/public_creds.txt
mv $DIR/*.privcreds $DIR/private_creds.txt
belenios-tool trustee-keygen --group $GROUP
mv *.pubkey $DIR/public_keys.jsons
mv *.privkey $DIR/private_keys.jsons
belenios-tool mktrustees --dir $DIR
rm -f $DIR/public_keys.jsons
