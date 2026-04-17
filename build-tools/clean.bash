#!/bin/bash 
# IOIO XXX update needed   This was created for legacy tools, that have been removed.

if [ `basename $PWD` != 'client-src' ]; then 
	cd client-src
fi



if [ -d ./build/src ]; then
	echo "PROBLEM: build has put stuff in wrong place again build/src/..."
	rm -rf ./build/src
fi 
if [ -d ./build/build ]; then
	echo "PROBLEM: build has put stuff in wrong place again build/build/..."
	rm -rf ./build/build
fi 


if [ -n "`ls build/services/*d.ts 2>/dev/null`" ]; then
	rm build/services/*d.ts
fi
if [ -n "`ls build/services/*map 2>/dev/null`" ]; then
	rm build/services/*map
fi
if [ -n "`ls build/services/*js 2>/dev/null`" ]; then
	rm build/services/*js
fi
if [ -n "`ls -d1 build/services/*/ 2>/dev/null `" ]; then
	rm -r `ls -d1 build/services/*/ `
fi

if [ -n "`ls build/components/*d.ts 2>/dev/null`" ]; then
	rm build/components/*d.ts
fi
if [ -n "`ls build/components/*map 2>/dev/null`" ]; then
	rm build/components/*map
fi
if [ -n "`ls build/components/*js 2>/dev/null`" ]; then
	rm build/components/*js
fi
if [ -n "`ls -d1 build/components/*/ 2>/dev/null `" ]; then
	rm -r `ls -d1 build/components/*/ `
fi


if [ -n "`ls build/*d.ts 2>/dev/null`" ]; then
	rm build/*d.ts
fi
if [ -n "`ls build/*map 2>/dev/null`" ]; then
	rm build/*map
fi
if [ -n "`ls build/*js 2>/dev/null`" ]; then
	rm build/*js
fi
if [ -n "`ls build/public/lib* 2>/dev/null`" ];then
	rm build/public/lib*
fi

mkdir -p build/types
cp src/types/vue3-touch-events.d.ts build/types/


cd ../server-src
if [ -n "`ls src/shopping/*d.ts 2>/dev/null`" ]; then
	rm src/shopping/*d.ts
fi
if [ -n "`ls src/shopping/*map 2>/dev/null`" ]; then
	rm src/shopping/*map
fi
if [ -n "`ls src/shopping/*js 2>/dev/null`" ]; then
	rm src/shopping/*js
fi

if [ -n "`ls src/*d.ts 2>/dev/null`" ]; then
	rm src/*d.ts
fi
if [ -n "`ls src/*map 2>/dev/null`" ]; then
	rm src/*map
fi
if [ -n "`ls src/*js 2>/dev/null`" ]; then
	rm src/*js
fi

if [ -n "`ls dist/test/*js 2>/dev/null`" ]; then
	rm dist/test/*js
fi
rm  dist -rf



