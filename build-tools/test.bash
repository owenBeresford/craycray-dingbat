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
	node $EXECDIR/vitest run --typecheck 
	# I see no way to look at an exit value, it doesn't set it.
	node $SEXECDIR/storybook build
	node $SEXECDIR/storybook dev -p 6006 
	node $SEXECDIR/storybook build -c .storybook-suspence/
	node $SEXECDIR/storybook dev -p 6006 -c .storybook-suspence/



	cd ..
fi

if [ "$what" = "be" -o "$what" = "all" ]; then
	cd server-src
	node $EXECDIR/vitest run --typecheck 
	cd ..
fi

