#!/bin/bash  
# PURPOSE: create static files that shouldnt be checked in to Git
#
# This file only supports debian or ubuntu family of Linux.  
# Assuming you are technical, it is quite simple to make a copy for other operating systems.
# Written in bash as faster to write and is more concise.
#
# Unfortunately, this script can't really be unit tested,
#  Please run with a '-x' param to the bash interpreter 

export BASE=`dirname "$0"`
export BASE="$BASE/.."
cd $BASE
export PRIVATE="dist/private"
export PROD_URL="app.hiss"  # Overwriten with value from user
# TODO Improvewment: Need to edit IPs where this is used
export PRTKEY="shoppinglist-private.key"
export PBCKEY="shoppinglist-public.pem"
# Data that might change:
export MKCERT_VERSION="v1.4.4"
export BIN_DIR=~/bin


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

########################################### CHOICE: strong, rootCA
read -t 5 -n 5 -i "Do you want 'strong' certs, or certs with a 'rootca'? (stupid question, but select implementation) " DAT
if [ $? -ne 0 ]; then   # above zero implies timeout (most likely)
	DAT="rootca"
fi
if [ "strong" == "$DAT" ]; then
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

	read -t 30 -n 100 -i "Enter your hostname (needed for the cert, users will later need to type this)" PROD_URL
	if [ $? -ne 0 ]; then
		exit 2
	fi

	ping -c 1 $PROD_URL 
	if [ $? -eq 2 ]; then
		echo "That domain name  '$PROD_URL' didnt work."
		exit 126
	fi


	openssl ecparam -genkey -name prime256v1 -noout -out $BASE/$PRIVATE/params.pem 
	if [ $? -ne 0 ]; then
		echo "1st Openssl cmd failed.  Panic, contact dev?"
		exit 8
	fi

	openssl pkcs8 -topk8 -nocrypt -in $BASE/$PRIVATE/params.pem -out $BASE/$PRIVATE/$PRTKEY
	if [ $? -ne 0 ]; then
		echo "2nd Openssl cmd failed.  Panic, contact dev?"
		exit 8
	fi

	openssl req -new -x509 -key $BASE/$PRIVATE/$PRTKEY -out $BASE/$PRIVATE/$PBCKEY -days 365 -subj "/CN=$PROD_URL" -addext "keyUsage = digitalSignature, keyEncipherment" -addext "extendedKeyUsage = serverAuth"
	if [ $? -ne 0 ]; then
		echo "3rd Openssl cmd failed.  Panic, contact dev?"
		exit 8
	fi

############################################################# else
elif [ "rootca" == "$DAT" ]; then
	read -t 5 -n 5 -i "This script will edit your local machine, and ask for root to do so.\nEnter to continue, or <cntl-C> to abort." IGNORED
	if [ $? -ne 0 ]; then
		exit 2
	fi

	read -t 30 -n 100 -i "Enter your hostname (needed for the cert, users will later need to type this)" PROD_URL
	if [ $? -ne 0 ]; then
		exit 2
	fi

	ping -c 1 $PROD_URL 
	if [ $? -eq 2 ]; then
		echo "That domain name  '$PROD_URL' didnt work."
		exit 126
	fi


	if [ ! -d $BIN_DIR ]; then
		# asks for root
		sudo apt install curl libnss3-tools -y 

		mkdir $BIN_DIR
		# edit path if dir not found, as users aren't likely to manually mention a dir that is absent.
		export PATH=$PATH:$BIN_DIR
	fi 

	if [ ! -f "$BIN_DIR/mkcert" ]; then
		curl -v https://github.com/FiloSottile/mkcert/releases/download/$MKCERT_VERSION/mkcert-$MKCERT_VERSION-linux-amd64 -L > $BIN_DIR/mkcert
		chmod 755 $BIN_DIR/mkcert 
	fi 

	# asks for root
	mkcert -install 
	echo -n "Your new local CAfile is"; mkcert -CAROOT 

	# TODO: Edit the following lines to have all the machines names OR IPs that you will use for this app.
	# 
	mkcert "$PROD_URL" localhost 192.168.1.218 ::1 

	# Where the app and tests expect the certs.
	mv ./*-key.pem $BASE/$PRIVATE/$PRTKEY
	mv ./*.pem     $BASE/$PRIVATE/$PBCKEY

########################################################################################################	
else
	echo "Unknown option entered '$DAT'"
	exit 127
fi	


echo -e "Certs for a year have been created just now.  Rerun this script after the year for more.\nThe certs are invisible to Git, do not add them to a repo."

# vim: nospell syn=bash

