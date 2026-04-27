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
rm $PIDFN 2>/dev/null
if [ "$1" = "-q" ]; then
	return
fi	

if [ "client-src" == "`basename $PWD`" -o "server-src" == "`basename $PWD`" ] ;then
	cd ..; 
fi
# might need to add Nest into this...
#  "#start:debug": "nest start --debug --watch",

# export SHOPPING_PORT=3001 
# export SHOPPING_IPADDR="192.168.1.218"  
export SHOPPING_CERT=./dist/private/server.pem
export SHOPPING_KEY=./dist/private/private.key  
export SHOPPING_PASSPHRASE='XXX add password here XXX'
# export NODE_DEBUG='tls,https'

node ./dist/main.min.mjs; 
echo $! > $PIDFN; 
cd -

