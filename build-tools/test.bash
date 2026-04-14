#!/bin/bash
EXECDIR=node_modules/.bin
export NODE_ENV=test
APIPID=~/.shopping.pid
SVRBIN=./server-src/bin/shopping.es.mjs
if [ ! -f "$SVRBIN" ]; then
	echo "Compile the source first."
	exit 1
fi	

what="all"
if [ ! -z "$1" ]; then
	what="$1"
fi

if [ "$what" = "fe" -o "$what" = "all" ]; then
    export CURSERVICE=0; 
	if [ -f $APIPID ]; then 
		export CURSERVICE=`cat $APIPID`; 
	fi; 
	if [ $CURSERVICE -lt 100 ]; then 
		node $APIPID
		echo $! >$APIPID
		echo "Manually started the API service."
	fi;
	cd client-src
	node $EXECDIR/vitest run -c vitest.config.ts --typecheck 2>/dev/null
	# vitest sets an exit of 1, if a test fails. 
	# I have added a thing for timeout to return 127
	# Due to using typeschecks, I cannot use this feature in Devops tools,  
	# as Vitest thinks there are ~850 errors in node_modules/@types, and is always 1

	node $SEXECDIR/storybook build
	# https://tiberriver256.github.io/web%20development/how-to-run-storybook-with-https-on-localhost/
	node $SEXECDIR/storybook dev -p 6006 --https --ssl-cert ./src/assets/cert.pem --ssl-key ./src/assets/private.key 

	node $SEXECDIR/storybook build -c .storybook-suspence/
	node $SEXECDIR/storybook dev -p 6006 -c .storybook-suspence/ --https --ssl-cert ./src/assets/cert.pem --ssl-key ./src/assets/private.key 

    # node node_modules/.bin/storybook dev -p 6006 --https --ssl-cert ./src/assets/cert.pem --ssl-key ./src/assets/private.key 
	# I wish I had a way to "run then quit" on Storybook

# vitest --typecheck --coverage
	cd ..
fi

if [ "$what" = "be" -o "$what" = "all" ]; then
	cd server-src
	node $EXECDIR/vitest run --typecheck 
	cd ..
fi

