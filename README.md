

## "business english" changelog


* Have better UX than the default google note taking app.
* To work in steel-frame supermarkets that block most 4g signal.
* To support edit-without-save so the same list can be used each week
* To have long-term storage capacity, with visible meta data so annual lists are feasible 

smaller goals:
* Avoid my hand writing
* A find feature
* Port data between phone and desktop/ laptop easily
* Be able to copy lists 
* Write some code that people can see, its not ground breaking.
WARN: to-date not actually ran this yet.


### To use


* clone repo to a big screen device
* Read the file, then Run build-tools/checksum.bash  this create scripts and runs `npm i` twice
* OR run `npm i` in each package directory, and build your own certs (maybe from **Letsencrypt**?) 
* run `npm run build:app`
* run `npm run app`
* launch on phone or desktop and build your initial lists (labour-intensive here)
* Nag me for JSON import from XYZ other platform capacity

* Advanced use: read TODO list


### Basic file system

- $root/
	- build-tools
		- bash scripts 	~ maybe port to Python later
	- common
		- code directly used by both sides
		- types 
	- client-src/
		- .storybook	~ these are config for strorybook tests
		- .storybook-suspense
		- src/
			- assets
			- components
			- services
			- test		~ several test tech inside
			- types
			- workers
			- assorted "main" here
	- dist/				~ compiled server-src files
		- public 	 	~ compiled assets from client-src
		- private		~ generated assets, that do not show in web page indexes
	- server-src
		- src
			- shopping
			- test
			- assorted "main" here

	- random config and notes


### Warnings / Caveats


- If you talk HTTP/0.9 or HTTP/1.0, or HTTP/1.1 to the API you get TCP transit, and nothing on higher protocols.  This is HTTPS and HTTP/2 only service, your browser should default to HTTPS and ALN upgrade steps.   
- This project likes Node24, absolutely no warranty if you attempt to run on older versions as I expect NPM will make your life very hard.  Package.json includes some magic for getting Node24, but that tech is very frail as it moves version of NPM.  #leSigh.
   - Assuming you are a techie, adopt/ deploy NVM to have flexibility.
- For better readability, I moved many local variable names to a non-English lang ~ fr-FR ~ so there is no clash with JS keywords.    Public symbols should be in en-UK.   This convention isn't global, but its not bad spelling.   JS does allow UTF-8 in variable names.
- TS says _LOGGING_ isn't defined in tests.   It is at test runtime.  ''I may be able to resolve this.''   This _LOGGING_ feature is to add test-only logging, that the build step strips.  
- Node supports a different Thread implementation to browsers.  I could make some more of my tests work, but that is adding code to pass test env that cannot be used outside of tests.  This is not productive.
- TS says Uint8Array.prototype.toHex doesn't exist.  Its a Baseline [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array/toHex].  
- TS says globalThis.crypto.subtle isn't available.  It is available at runtime in Node, for v24 and some earlier.  This JUST runs memory counting tests, and has no impact on production.
- Build tools will complain "Failed to load source map" for ./client-src/src/assets/foundation.min.css.  Yes this file is absent.  Don't worry.  I may go back to normal package import later.


### User interaction (draft grade)


If this was paid work, I would be using a more graphical and less indexable file, from one of:
* [Figma: The most fancy interaction design tool, running in browser or a native app](https://figma.com "Figma")
* [Mockplus: Another tool I haven't used, no review](https://www.mockplus.com/blog/post/user-journey-map "Mockplus")
* [Balsamiq: The old tool that I find much faster to deliver a basic sketch with](https://balsamiq.com/wireframes/cloud/ "Balsamiq")
* others


User journeys:
* user1 tries app by going to my LAN, opening supplied URL in phone
* sees context help, likely skims, closes
* sees lists
* taps to open a list
* plays with swiping
* tries a long tap, and gets edit
* looks at burger menu
* closes the PWA

* user2 actually uses app by opening it
* starts a new list with the 'new' button
* then spends 30min browsing cupboards, and adding items to list as necessary
* hits save to persist this list; does not close the PWA app
* engages transport to get to shops
* buys items, and swipes the items off
* closes app without saving it, so swiped list isn't persisted

* next week, user2 opens the PWA, 
* and sees the list of lists on loading; then loads the list they made previously
* repeats shopping process

* user1 returns to the PWA, and builds a christmas shopping list
* then saves it

* several months later; user1 goers shopping with the handily saved list


