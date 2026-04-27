#!/bin/bash 
# This script reads and follows $NODE_ENV
# accepts "--be" and "--fe"
# If I ever move to support win32, I will need to port this to Python3

what="all"
if [ -n "$1" ]; then
	what="$1"
fi
EXECDIR=./node_modules/.bin
buildenv="test"
if [ -n "$NODE_ENV" ]; then
	buildenv=$NODE_ENV;
fi
# Node version is set via NVM
NODEBIN='node '

if [ "$what" == "--fe" -o "$what" == "all" ]; then
	echo "**** Running compiling client side ****"
	if [ "`basename $PWD`" != "client-src" ]; then
		if [ "`basename $PWD`" == "server-src" ]; then
			cd ../client-src
		else
			cd client-src
		fi
	fi
	$NODEBIN $EXECDIR/vite --config ./vite.config.mjs build --l info
	ret=$?
	if [ $ret -ne 0 ]; then
		echo "Tool main vite exited $ret on *.ts"
		exit 1
	else 
		cp dist/*.mjs ../dist/public/
	fi
	$NODEBIN $EXECDIR/vite --config ./vite.config.test-worker.mjs build --l info
	ret=$?
	if [ $ret -ne 0 ]; then
		echo "Tool sync vite exited $ret on *.ts"
		exit 1
	else 
		cp dist/*.mjs ../dist/public/
	fi

	$NODEBIN $EXECDIR/uglifycss --max-line-len 2000 ./src/assets/shopping.css >./shopping.tmp.css
	ret=$?
	if [ $ret -ne 0 ]; then
		echo "Tool uglifycss exited $ret on *.css"
		exit 1
	fi
	cat ./src/assets/foundation.min.css ./shopping.tmp.css > ../dist/public/shopping.min.css
	cp src/assets/favicon.ico ../dist/public/
	cp src/assets/index.html ../dist/public/
	cp src/assets/logo.png ../dist/public/
	cp src/assets/manifest.json ../dist/public/	
	cp src/assets/cert.pem ../dist/public/
	cp src/assets/private.key ../dist/public/

	echo "Created fresh shopping.min.css ."
	rm ./shopping.tmp.css
	cd ..
fi



if [ "$what" == "--be" -o "$what" == "all" ]; then
	echo "**** Compiling back end code ****"
	revert=0
	if [ "`basename $PWD`" != "server-src" ]; then
		cd server-src/
		revert=1
	fi
	mkdir -p ../dist/
	echo "The nextJS builder doesn't put stuff in dist OR public OR build. . .  So here is this *solution* in an unfashionable language."
# maybe issue:: building with Vite or Nest?
#	node $EXECDIR/nest build
#	node $EXECDIR/vite --config ./vite.config.mjs build --l info
    node $EXECDIR/ncc build src/main.ts -o ../dist/ -m --target=es2022 --stats-out=/tmp/shopping-build-stats.json --no-cache 
	ret=$?
	if [ $ret -ne 0 ]; then
		echo "Tool NCC exited $ret on API build"
		exit 1
	fi
	mv ../dist/index.js ../dist/main.min.mjs
	rm -r ../dist/home/

	if [ ! -f ../dist/public/list.json ]; then
		echo "{}" > ../dist/public/list.json
	fi
	if [ $revert ]; then
		cd ..
	fi
fi

# to EXEC 
#  node --es-module-specifier-resolution=node dist/main.js

