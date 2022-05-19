#!/bin/bash

PRIV_KEYS_FILE_PATH=$1
PARTIAL_DECRYPTION_FILE_PATH=$2
RESULT_FILE_PATH=$3
DIR=$4
TEMP_PRIV_KEY_FILE=tmp_priv_key_file.tmp

cd $DIR
for u in $(cat $PRIV_KEYS_FILE_PATH); do
    echo $u > $TEMP_PRIV_KEY_FILE
    belenios-tool decrypt --privkey $TEMP_PRIV_KEY_FILE --dir $DIR
    echo >&2
done > $PARTIAL_DECRYPTION_FILE_PATH

belenios-tool validate --dir $DIR

cat $RESULT_FILE_PATH
