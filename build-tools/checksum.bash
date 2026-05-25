#!/bin/bash  
#
# Setup the files that arent checked-in. 
# Written in bash as faster to write and is more concise
#
#  Node people will probably get anxiety about all the return early branches
#    So I used bash
# Unfortunately, this script can't really be unit tested,
#  please run with a '-x' param to the bash interpreter 

# https://www.certguard.app/blog/self-signed-certificates-dev-ci-testing
# add legacy SSL certs for storybook

export BASE=`dirname "$0"`
export BASE="$BASE/.."
cd $BASE
export PRIVATE="dist/private"
export PROD_URL="app.hiss"  # edit to take value from user

bigVersion=`node -v | sed -e "s/v//" -e "s/\..*//"`
if [ "24" != "$bigVersion" ]; then
	echo -e "ERROR: I strongly advise Node24 or NPM will be hell.\nThis isnt present on the path now.\n"
	read -t 5 -n 5 -i "Would you like me to try NVM?.  Unless aborted now with <cntl-C>." IGNORED
	if [ $? -ne 0 ]; then
		exit 2
	fi
	nvm use v24.13.0 
	if [ $? -ne 0 ]; then
		echo "NVM didn't 'just work', please manually fix."
		exit 10
	fi
fi

if [ ! -f "$BASE/client-src/package-lock.json" ]; then
	if [ -z "`which npm`" ]; then
		echo "ERROR: npm isnt installed or is absent from PATH.  Please fix"
		exit 5
	fi
	read -t 5 -n 5 -i "Running 'npm install' on client unless aborted now with <cntl-C>." IGNORED
	if [ $? -ne 0 ]; then
		exit 2
	fi
	echo "Please hold whilst 100+ packages deploy"
	npm i
	cd $BASE/common
	if [! -d ./node_modules ]; then
		ln -s $BASE/client-src/node_modules ./node_modules
	fi	
fi
if [ ! -f "$BASE/server-src/package-lock.json" ]; then
	# Yes, I need to check twice
	if [ -z "`which npm`" ]; then
		echo "ERROR: npm isnt installed or is absent from PATH.  Please fix"
		exit 5
	fi
	read -t 5 -n 5 -i "Running 'npm install' on server unless aborted now with <cntl-C>." IGNORED
	if [ $? -ne 0 ]; then
		exit 2
	fi
	npm i
fi

mkdir -p $BASE/dist/public
mkdir -p $BASE/$PRIVATE

if [ -z "`which openssl`" ]; then
	echo "ERROR: Please install openassl, or add it to the PATH."
	exit 6
fi

bigVersion=`openssl version | sed -e "s/OpenSSL //" -e "s/\..*//" `
if [ 3 -gt "$bigVersion" ]; then
	echo "ERROR: Please use a newer and more stable version of OpenSSL (>=3.0)"
	exit 7
fi

echo -e "This makes a cert for the local host ~ where the tests are run.\nDo you want to setup a host name (in your hosts file)? If so, break this and do it now."
read -t 5 -n 5 -i "Hit enter to continue, or <cntl-C> to abort." IGNORED
if [ $? -ne 0 ]; then
	exit 2
fi

openssl ecparam -genkey -name prime256v1 -noout -out $BASE/dist/private/params.pem 
# openssl genpkey -genparam -algorithm ec -pkeyopt ec_paramgen_curve:P-256 -out ~/VALUELESS-params-P-256.pem
if [ $? -ne 0 ]; then
	echo "1st Openssl cmd failed.  Panic, contact dev?"
	exit 8
fi

openssl pkcs8 -topk8 -nocrypt -in $BASE/dist/private/params.pem -out $BASE/dist/private/private.key
#echo "This next step is interactive, please follow prompts for a new web cert"
#openssl req -newkey ec:/home/$USER/VALUELESS-params-P-256.pem -keyout $PRIVATE/private.key -out $PRIVATE/csr.pem
if [ $? -ne 0 ]; then
	echo "2nd Openssl cmd failed.  Panic, contact dev?"
	exit 8
fi

openssl req -new -x509 -key $BASE/dist/private/private.key -out $BASE/dist/private/server.pem -days 365 -subj "/CN=$PROD_URL" -addext "keyUsage = digitalSignature, keyEncipherment" -addext "extendedKeyUsage = serverAuth"
# openssl req -x509 -key $PRIVATE/private.key -in $PRIVATE/csr.pem -out  $PRIVATE/server.pem -days 365 -sha256 
if [ $? -ne 0 ]; then
	echo "3rd Openssl cmd failed.  Panic, contact dev?"
	exit 8
fi

echo -e "Certs for a year have been created just now.  Rerun this script after the year for more.\nThe certs are invisible to Git, do not add them to a repo."

# vim: nospell syn=bash

