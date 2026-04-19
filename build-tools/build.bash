#!/bin/bash 
# This script reads and follows $NODE_ENV
# accepts "--be" and "--fe"
# If I ever move to support win32, I will need to port this to Python3

what="all"
if [ ! -z "$1" ]; then
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
	if [ "`basename $PWD`" != "client-src" ]; then
		cd client-src
	fi
	$NODEBIN $EXECDIR/vite --config ./vite.config.mjs build --l info
	ret=$?
	if [ $ret -ne 0 ]; then
		echo "Tool main vite exited $ret on *.ts"
		exit 1
	fi
	$NODEBIN $EXECDIR/vite --config ./vite.config.test-worker.mjs build --l info
	ret=$?
	if [ $ret -ne 0 ]; then
		echo "Tool sync vite exited $ret on *.ts"
		exit 1
	fi

	$NODEBIN $EXECDIR/uglifycss --max-line-len 2000 ./src/assets/shopping.css >./shopping.tmp.css
	ret=$?
	if [ $ret -ne 0 ]; then
		echo "Tool uglifycss exited $ret on *.css"
		exit 1
	fi
	cat ./src/assets/foundation.min.css ./shopping.tmp.css > ../dist/public/shopping.min.css
	cp src/asset/favicon.ico ../dist/public/
	cp src/asset/index.html ../dist/public/
	cp src/asset/logo.png ../dist/public/
	cp src/asset/manifest.json ../dist/public/	
	cp src/asset/cert.pem ../dist/public/
	cp src/asset/private.key ../dist/public/

	echo "Created fresh shopping.min.css ."
	rm ./shopping.tmp.css
	cd ..





elif [ "$what" == "--be" -o "$what" == "all" ]; then
	echo "running back end code"
	revert=0
	if [ "`basename $PWD`" != "server-src" ]; then
		cd server-src/
		revert=1
	fi
	echo "The nextJS builder doesn't put stuff in dist OR public OR build. . .  So here is this *solution* in an unfashionable language."
# maybe issue:: building with Vite or Nest?
	node $EXECDIR/nest build
	ret=$?
	if [ $ret -ne 0 ]; then
		echo "Tool exited $ret on nest build"
		exit 1
	fi

	mkdir -p ../dist/
#	mv src/*js ../dist/
#	mv src/*js.map dist
#	mv src/shopping/*js dist/shopping
#	mv src/shopping/*js.map dist/shopping

	if [ ! -f ../dist/public/list.json ]; then
		echo "{}" > ../dist/public/list.json
	fi
	if [ $revert ]; then
		cd ..
	fi
fi





if [ "$what" == "--fe-DISABLED" -o "$what" == "all-DISABLED" ]; then
	echo "running front end code"
	cd client-src
	
	if [ ! -d ./build/components/ ]; then
		mkdir -p ./build/components/
		mkdir -p ./build/services/
		mkdir -p ./build/public/
		mkdir -p ./build/types/
		mkdir -p ./build/workers/
	fi
	if [ -f "build/services/AList.d.ts" ]; then
		echo "You haven't run clean; expect warnings"
	fi

	cp ./src/components/*ts ./build/components/
	cp ./src/components/*vue ./build/components/
	cp ./src/services/*ts 	./build/services/
	cp ./src/types/*ts 		./build/types/
	cp ./src/workers/*ts 	./build/workers/
	cp ./src/main.ts 		./build/
	cp ./src/Constants.ts 	./build/
	cp ./src/App.vue 		./build/

	sed -e "s/\.vue'/.js'/" -i build/main.ts
	sed -e "s/\.vue'/.js'/" -i build/components/Routing.ts
	sed -e "s/\.vue'/.js'/" -i build/components/ListOfLists.vue
	sed -e "s/\.vue'/.js'/" -i build/components/TabBar.vue
	sed -i -e 's/V2D.Vector/Vector/g' ./build/services/MotionStream.ts 
	sed -i -e "s/\\(import \* as V2D from \\).*/\\1 'vector2d\\/src\\/Vector';/" ./build/services/MotionStream.ts 

#	for x in `ls -1 build/components/*.vue`; do
	declare -a fixedListFiles=("build/components/EnterInput.vue" "build/components/UnknownRoute.vue" "build/components/InterstitialView.vue" "build/components/ThisList.vue" "build/components/ListOfLists.vue" "build/components/ThisList.vue" "build/components/TabBar.vue" "build/components/Routing.ts" "build/App.vue") 
	for x in ${fixedListFiles[@]} ; do
		self=""
		if [ $x == "build/components/Routing.ts" ]; then
			self=`basename $x '.ts'`
		else
			self=`basename $x '.vue'`
		fi
		loc=`dirname $x`
		echo "FIXING '$x' $loc $self"
		/usr/bin/node $EXECDIR/rollup -c rollup.config.vue.js --environment BUILD:$buildenv -i $x -o $loc/$self.js
		ret=$?
		if [ $ret -ne 0 ]; then
			echo "Tool exited $ret on rollup.config.vue.js $x"
			exit 1
		fi
	
		if [ $x == "build/components/ThisList.vue" ]; then
			sed -i -e 's/V2D.Vector/Vector/g' ./build/components/ThisList.js
			sed -i -e "s/\\(import \* as V2D from \\).*/\\1 'vector2d\\/src\\/Vector';/" ./build/components/ThisList.js
			sed -i -e 's/V2D.Vector/Vector/g' build/types/Motionable.ts
			sed -i -e "s/\\(import \* as V2D from \\).*/\\1 'vector2d\\/src\\/Vector';/" build/types/Motionable.ts
		fi
		if [ $x == "build/components/TabBar.vue" ]; then
			sed -i -e 's/V2D.Vector/Vector/g' ./build/components/TabBar.js
			sed -i -e "s/\\(import \* as V2D from \\).*/\\1 'vector2d\\/src\\/Vector';/" ./build/components/TabBar.js
			sed -i -e 's/V2D.Vector/Vector/g' build/types/Motionable.ts
			sed -i -e "s/\\(import \* as V2D from \\).*/\\1 'vector2d\\/src\\/Vector';/" build/types/Motionable.ts
		fi

		vim -c "%s/\/\/START IMPORT CODE $self\_.*\/\/START LOCAL CODE $self// | %s/\/\/import /import / | wq" $loc/$self.js
		ret=$?
		if [ $ret -ne 0 ]; then
			echo "Tool exited $ret on $x"
			exit 1
		fi

#		if [ $x != "build/App.vue" ]; then
## general rule of internet 4: do not use regex to parse HTML or source code
#		vim -c '%s/\(\_.*\)\(^import [^\r\n]*\)\_.*START REAL CODE/\1\2/ | %s/export { script as default };/export { script as "'$self'" };/ | wq' $loc/$self.js
#			vim -c '%s/\/\/\(import .*\)/\1/' -c '%s/\(\_.*\)\(^import [^\r\n]*\)\_.*START REAL CODE/\1\2/ | wq' $loc/$self.js
#			vim -c '%s/\(\_.*\)\(^import [^\r\n]*\)\_.*START REAL CODE/\1\2/ | wq' $loc/$self.js
#			ret=$?
#			if [ $ret -ne 0 ]; then
#				echo "Tool exited $ret on $x"
#				exit 1
#			fi
#		fi
	done

	$NODEBIN --max_old_space_size=12184 $EXECDIR/rollup -c rollup.config.vue-b.js --environment BUILD:$buildenv 
	ret=$?
	if [ $ret -ne 0 ]; then
		echo "Tool exited $ret on rollup.config.vue-b.js"
		exit 1
	fi

	$NODEBIN $EXECDIR/vue-tsc --declaration --downlevelIteration --experimentalDecorators --emitDeclarationOnly --skipLibCheck ./build/main.ts
	ret=$?
	if [ $ret -ne 0 ]; then
		echo "Tool exited $ret on vue-tsc all..."
		exit 1
	fi

	$NODEBIN $EXECDIR/vue-tsc --declaration --downlevelIteration --experimentalDecorators --emitDeclarationOnly  build/App.vue
	ret=$?
	if [ $ret -ne 0 ]; then
		echo "Tool exited $ret on vue-tsc src/App.vue"
		exit 1
	fi

	sed -i -e 's/V2D.Vector/Vector/g' ./build/components/ThisList.js
	sed -i -e "s/\\(import \* as V2D from \\).*/\\1 'vector2d\\/src\\/Vector';/" ./build/components/ThisList.js
	sed -i -e 's/V2D.Vector/Vector/g' ./build/components/TabBar.js
	sed -i -e "s/\\(import \* as V2D from \\).*/\\1 'vector2d\\/src\\/Vector';/" ./build/components/TabBar.js

# says not possible
# https://stackoverflow.com/questions/52880039/how-to-remove-vue-extension-from-imports-when-using-typescript-in-vue-js
#mv build/components/Routing.js build/components/Routing.js.1  

# i tried to use plugin-replace; I cant get it to affect the source code in the write place
#for x in `ls -1 build/components/*js`; do
#	sed -i -e 's/V2D.Vector/Vector/' $x 
#	sed -i -e "s/\\(import \* as V2D from \\).*/\\1 'vector2d\\/src\\/Vector';/" $x
#
#done

	if [ ! -f ./build/public/libs.HASHCODE.js ]; then 
		if [ "$buildenv" == "production" ]; then
			echo "const exports={};" > ./build/public/libs.HASHCODE.js
			awk 1 node_modules/vue/dist/vue.global.prod.js node_modules/vue-router/dist/vue-router.global.prod.js node_modules/vue3-touch-events/index.js node_modules/vuex/dist/vuex.global.prod.js node_modules/vector2d/src/AbstractVector.js node_modules/vector2d/src/ArrayVector.js node_modules/vector2d/src/Vector.js node_modules/reflect-metadata/Reflect.js >> ./build/public/libs.HASHCODE.js
		else 
			echo "const exports={};" > ./build/public/libs.HASHCODE.js
			awk 1  node_modules/vue/dist/vue.global.js node_modules/vue-router/dist/vue-router.global.js node_modules/vue3-touch-events/index.js node_modules/vuex/dist/vuex.global.js node_modules/vector2d/src/AbstractVector.js node_modules/vector2d/src/ArrayVector.js node_modules/vector2d/src/Vector.js node_modules/reflect-metadata/Reflect.js >> ./build/public/libs.HASHCODE.js
#  #leSigh
		fi
		sed -e 's/export default vueTouchEvents//' \
			-e 's/__VUE_OPTIONS_API__\([^=]*=[^=]*\)$/true\1/' \
			-e 's/__VUE_PROD_DEVTOOLS__\([^=]*=[^=]*\)$/true\1/' \
			-e 's/var AbstractVector_1 = require(.\+$//' \
			-e 's/AbstractVector_1\.//' \
			-i ./build/public/libs.HASHCODE.js
		echo "var vue = Vue; ">> ./build/public/libs.HASHCODE.js
	fi
	cp ./build/public/libs.HASHCODE.js ./public/libs.js
	cp ./build/public/libs.HASHCODE.js ./public/libs.min.js

	$NODEBIN --max_old_space_size=8184 $EXECDIR/rollup -c ./rollup.config.minify.js --environment BUILD:$buildenv 
	ret=$?
	if [ $ret -ne 0 ]; then
		echo "Tool minify exited $ret on the rollup.minify.js config"
		exit 1
	fi
	cp ./build/public/shopping.min.js ./public/shopping.min.js	
	cp ./build/public/shopping.test.js ./public/shopping.test.js	

	$NODEBIN $EXECDIR/uglifycss --max-line-len 2000 ./src/assets/shopping.css >./build/shopping.tmp.css
	ret=$?
	if [ $ret -ne 0 ]; then
		echo "Tool uglifycss exited $ret on *.css"
		exit 1
	fi
	cat ./src/assets/foundation.min.css ./build/shopping.tmp.css > ./public/shopping.min.css
	echo "Created fresh shopping.min.css ."
	cd ..

elif [ "$what" == "--be" -o "$what" == "all" ]; then

	echo "running back end code"
	cd server-src/
	echo "The nextJS builder doesn't put stuff in dist OR public OR build. . .  So here is this *solution* in an unfashionable language."
	$EXECDIR/nest build
	ret=$?
	if [ $ret -ne 0 ]; then
		echo "Tool exited $ret on nest build"
		exit 1
	fi

	mkdir -p dist/shopping
	mv src/*js dist/
	mv src/*js.map dist
	mv src/shopping/*js dist/shopping
	mv src/shopping/*js.map dist/shopping

	if [ ! -f dist/shopping/list.json ]; then
		echo "{}" > dist/shopping/list.json
	fi
	cd ..
fi

# to EXEC 
#  node --es-module-specifier-resolution=node dist/main.js

