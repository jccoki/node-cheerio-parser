#!/bin/bash

for i in `seq 1 446`; do
  wget "http://www.mortgageandfinancehelp.com.au/find-accredited-broker/?page=$i" -O $i &
  for j in `seq 1 5000`; do
    echo;
  done;
done
