#!/bin/bash 
# PURPOSE: hold env details and launch app, also supported stop.

export CURSERVICE=0; 
PIDFN=~/shopping.pid 
if [ -f $PIDFN ]; then 
	export CURSERVICE=`cat $PIDFN`; 
fi; 
if [ -n "$CURSERVICE" ]; then 
	if [ $CURSERVICE -gt 100 ]; then
		echo "Sent a kill(15) to [old instance] $CURSERVICE"
		kill $CURSERVICE; 
	    reset 
	fi
fi; 
rm $PIDFN 2>/dev/null
if [ "$1" = "-q" ]; then
	exit
fi	

if [ "client-src" == "`basename $PWD`" -o "server-src" == "`basename $PWD`" ] ;then
	cd ..; 
fi
# Another option: run via Nestjs
#   node node_modules/.bin/nest start --debug 

export SHOPPING_CERT=./dist/private/shoppinglist-public.pem
export SHOPPING_KEY=./dist/private/shoppinglist-private.pem  
export SHOPPING_PASSPHRASE=""
export NODE_DEBUG='https,http'
# export NODE_DEBUG='tls,https'

node ./dist/main.min.mjs & 
echo $! > $PIDFN; 
cd -

