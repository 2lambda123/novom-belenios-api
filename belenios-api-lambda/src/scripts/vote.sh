#!/bin/bash

PRIVCRED=$1
BALLOT=$2
DIR=$3

belenios-tool vote --privcred <(echo "$PRIVCRED") --ballot <(echo "$BALLOT") --dir "$DIR"
