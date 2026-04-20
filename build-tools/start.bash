#!/bin/bash 

export CURSERVICE=0; 
PIDFN=~/shopping.pid 
if [ -f $PIDFN ]; then 
	export CURSERVICE=`cat $PIDFN`; 
fi; 
if [ -n "$CURSERVICE" ]; then 
	if [ $CURSERVICE -gt 100 ]; then
		kill $CURSERVICE; 
	fi
fi; 
cd ..; 
# might need to add Nest into this...
#  "#start:debug": "nest start --debug --watch",

# export SHOPPING_PORT=3001 
# export SHOPPING_IPADDR="192.168.1.218"  
SHOPPING_KEY=./dist/public/cert.pem
SHOPPING_CERT=./dist/public/private.key  

node ./dist/api.es.mjs; 
echo $! > $PIDFN; 
cd -

