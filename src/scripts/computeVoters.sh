#!/bin/bash

PRIVCRED_FILE_PATH=$1
DIR=$2

belenios-tool compute-voters --dir $DIR --privcred $PRIVCRED_FILE_PATH
