#!/bin/bash
EXECDIR=node_modules/.bin
export NODE_ENV=development
APIPID=~/shopping.pid
SVRBIN=./dist/main.min.mjs
if [ ! -f "$SVRBIN" ]; then
	echo "Compile the source first."
	exit 1
fi	

what="all"
if [ ! -z "$1" ]; then
	what="$1"
fi
export CI=true 
LAUNCHED=0

if [ "$what" = "fe" -o "$what" = "all" ]; then
    export CURSERVICE=0; 
	if [ -f $APIPID ]; then 
		export CURSERVICE=`cat $APIPID`; 
	fi; 
	if [ "$CURSERVICE" -lt 100 ]; then 
		node $SVRBIN &
		echo $! >$APIPID
		LAUNCHED=1
		echo "Manually started the API service."
	fi;
	if [ "`basename $PWD`" != "client-src" ]; then
		cd client-src
	fi

	node $EXECDIR/vitest run -c vitest.config.ts --typecheck --isolate 
	# vitest sets an exit of 1, if a test fails. 
	# I have added a thing for timeout to return 127
	# Due to using typeschecks, I cannot use this feature in Devops tools,  
	# as Vitest thinks there are ~850 errors in node_modules/@types, and is always 1

	node $SEXECDIR/storybook build
	# https://tiberriver256.github.io/web%20development/how-to-run-storybook-with-https-on-localhost/
	node $SEXECDIR/storybook dev -p 6006 --https --ssl-cert ../dist/private/server.pem --ssl-key ../dist/private/private.key 

	node $SEXECDIR/storybook build -c .storybook-suspence/
	node $SEXECDIR/storybook dev -p 6006 -c .storybook-suspence/ --https --ssl-cert ../dist/private/server.pem --ssl-key ../dist/private/private.key 

    # node node_modules/.bin/storybook dev -p 6006 --https --ssl-cert ../dist/private/server.pem --ssl-key ../dist/private/private.key 
	# I wish I had a way to "run then quit" on Storybook
	# UPDATE: there is a 'run all tests' button, just need a CLI access path

# vitest --typecheck --coverage
	cd ..
fi

if [ "$what" == "be" -o "$what" == "all" ]; then
	if [ "`basename $PWD`" != "server-src" ]; then
		cd server-src
	fi
	if [ "$CURSERVICE" -lt 100 -a "$LAUNCHED" == "0" ]; then 
		node $SVRBIN &
		echo $! >$APIPID
		LAUNCHED=1
		echo "Manually started the API service."
	fi;

	node $EXECDIR/vitest run --typecheck --isolate 
	cd ..
fi
unset CI

