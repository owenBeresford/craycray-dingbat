#!/bin/bash
EXECDIR=./node_modules/.bin
NODEBIN='node '

tweak=""
if [ "$1" == "--fix" ]; then
	tweak="--fix"
fi
args="--no-cache --exit-on-fatal-error $tweak "
if [ `basename $PWD` != 'client-src' ]; then
	cd client-src
fi

####################################################################################
$NODEBIN $EXECDIR/prettier --write src
ret=$?
if [ $ret -ne 0 ]; then
	echo "[step 1/4 client] Prettier tool exited $ret on src/* "
	exit 1
fi

$NODEBIN $EXECDIR/eslint src/*.ts src/services/*.ts src/components/*.ts src/workers/*.ts  $args
ret=$?
if [ $ret -ne 0 ]; then
	echo "[step 2/4 client] Eslint tool exited $ret on the TS source"
	exit 1
fi

$NODEBIN $EXECDIR/eslint -c src/components/.eslintrc.json src/components/*.vue $args
ret=$?
if [ $ret -ne 0 ]; then
	echo "[step 3/4 client] Eslint exited $ret on ./src/components/*.vue"
	exit 1
fi

$NODEBIN $EXECDIR/vue-tsc -p ./tsconfig.json
ret=$?
if [ $ret -ne 0 ]; then
	echo "[step 4/4 client] vue-tsc tool exited $ret on everything"
	exit 1
fi

############################################################################

cd ../server-src
$NODEBIN $EXECDIR/prettier  --write src
ret=$?
if [ $ret -ne 0 ]; then
	echo "[step 1/3 server] Tool exited $ret on src/* "
	exit 1
fi

$NODEBIN $EXECDIR/eslint src/main.ts src/shopping/*.ts $args
ret=$?
if [ $ret -ne 0 ]; then
	echo "[step 2/3 server] Tool exited $ret on src/main.ts"
	exit 1
fi

$NODEBIN $EXECDIR/vue-tsc -p ./tsconfig.json
ret=$?
if [ $ret -ne 0 ]; then
	echo "[step 3/3 server] vue-tsc exited $ret on everything"
	exit 1
fi

cd ..

