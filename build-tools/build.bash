#!/bin/bash 
# This script reads and follows $NODE_ENV
# accepts "--be" and "--fe"
# If I ever move to support win32, I will need to port this to Python3

what="all"
if [ -n "$1" ]; then
	what="$1"
fi
EXECDIR=./node_modules/.bin
buildenv="development"
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
		# TODO work out why my FE deps now inject checks against "process.env"
		echo -n "const process={env:{}};" > ../dist/public/shopping.es.min.mjs
		cat dist/shopping.es.mjs >> ../dist/public/shopping.es.min.mjs
	fi
	$NODEBIN $EXECDIR/vite --config ./vite.config.test-worker.mjs build --l info
	ret=$?
	if [ $ret -ne 0 ]; then
		echo "Tool sync vite exited $ret on *.ts"
		exit 1
	else 
		cp dist/worker1.es.mjs ../dist/public/worker1.es.min.mjs
	fi

	bigVersion=`node -v | sed -e "s/v//" -e "s/\..*//"`
	if [ "$bigVersion" -lt "24" ]; then
		echo "NVM seems absent from this shell.  Currently limping on node $bigVersion"
		exit 3
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
# old test certs.
#	cp src/assets/cert.pem ../dist/public/
#	cp src/assets/private.key ../dist/public/

	echo "Created fresh shopping.min.css ."
	rm ./shopping.tmp.css
	rm ./dist/*.*

# build storybook tests
	node $EXECDIR/storybook build
	node $EXECDIR/storybook build -c .storybook-suspence/
	cd ..
fi



if [ "$what" == "--be" -o "$what" == "all" ]; then
	echo "**** Compiling back end code ****"
	revert=0
	if [ "`basename $PWD`" != "server-src" ]; then
		if [ "`basename $PWD`" == "client-src" ]; then
			cd ../server-src
		else
			cd server-src
		fi
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

	if [ ! -f ../dist/private/list.json ]; then
		echo "[]" > ../dist/private/list.json
	else
		echo "At build time, there exists a list.json file, check its correct."
	fi
	if [ $revert ]; then
		cd ..
	fi
fi

# to EXEC 
#  node dist/main.js

