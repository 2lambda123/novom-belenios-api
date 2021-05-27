#!/bin/bash

belenios-tool () {
  dependencies/belenios/_build/install/default/bin/belenios-tool "$@"
}

PRIVCRED=$1
BALLOT=$2
BALLOT_FILE_PATH=$3
DIR=$4

belenios-tool vote --privcred <(echo "$PRIVCRED") --ballot <(echo "$BALLOT") --dir "$DIR" >> "$BALLOT_FILE_PATH"
