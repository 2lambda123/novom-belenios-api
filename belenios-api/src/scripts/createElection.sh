#!/bin/bash

belenios-tool () {
  dependencies/belenios/_build/install/default/bin/belenios-tool "$@"
}

UUID=`belenios-tool generate-token`
echo -n $UUID
