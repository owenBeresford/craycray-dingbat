

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


* This project likes Node24, absolutely no warranty if you attempt to run on older versions as I expect NPM will make your life very hard.  Package.json includes some magic for getting Node24, but that tech is very frail as it moves version of NPM.  #leSigh.
   * Assuming you are a techie, adopt/ deploy NVM to have flexibility.
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


