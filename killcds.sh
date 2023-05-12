#!/bin/bash
# lwctl -c basic-tools kill -9 $(lwctl -c basic-tools ps aux | grep 'cds run' | awk '{print $2}')
processes=( $(lwctl -c basic-tools ps aux | grep 'cds run' | awk '{print $2}') )
len=${#processes[@]}
echo "killcds [version 1.0 TMS 2022]"
echo "Number of CDS processes found = $len"
if [[ $len -gt 0 ]];
then
  lwctl -c basic-tools kill -9 $(lwctl -c basic-tools ps aux | grep 'cds run' | awk '{print $2}')
  echo "CDS processes have been killed"
fi