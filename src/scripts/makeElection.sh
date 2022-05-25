#!/bin/bash

UUID=$1
TEMPLATE=$2
GROUP=$3
DIR=$4

belenios-tool mkelection --uuid $UUID --template $TEMPLATE --group $GROUP --dir $DIR
