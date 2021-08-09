#!/bin/bash

belenios-tool () {
  dependencies/belenios/_build/install/default/bin/belenios-tool "$@"
}

PRIVCRED=$1
BALLOT=$2
DIR=$3

belenios-tool vote --privcred <(echo "$PRIVCRED") --ballot <(echo "$BALLOT") --dir "$DIR"
