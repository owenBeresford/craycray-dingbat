#!/bin/bash 

export CURSERVICE=0; 
PIDFN=~/shopping.pid 
if [ -f $PIDFN ]; then 
	export CURSERVICE=`cat $PIDFN`; 
fi; 
if [ $CURSERVICE -gt 100 ]; then 
	kill $CURSERVICE; 
fi; 
cd ..; 
# might need to add Nest into this...
#  "#start:debug": "nest start --debug --watch",
node ./dist/api.es.mjs; 
echo $! > $PIDFN; 
cd -

