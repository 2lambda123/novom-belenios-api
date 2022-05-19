#!/bin/bash

PRIVCRED=$1
BALLOT=$2
DIR=$3
TEMP_PRIV_CRED_FILE=temp_priv_cred.tmp
TEMP_BALLOT_FILE=temp_ballot.tmp

cd $DIR
echo $PRIVCRED > $TEMP_PRIV_CRED_FILE
echo $BALLOT > $TEMP_BALLOT_FILE
belenios-tool vote --privcred $TEMP_PRIV_CRED_FILE --ballot $TEMP_BALLOT_FILE --dir "$DIR"
