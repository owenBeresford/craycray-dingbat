

## "business english" changelog


- Have better UX than the default google note taking app.
- To work in steel-frame supermarkets that block most 4g signal.
- To support edit-without-save so the same list can be used each week
- To have long-term storage capacity, with visible meta data so annual lists are feasible 

smaller goals:
- Avoid my hand writing
- A find feature
- Port data between phone and desktop/ laptop easily
- Be able to copy lists (absent from Google freeware)
- Write some code that people can see, its not ground breaking.


### Technical deliveries


- A full TS product, aside from some tests made without types for dev speed.  #blah
- A HTTP2/HTTPS API artefact, despite that fact that Node HTTP2 integration isn't mature/ complete yet. 
- Service designed for intermittent networking.  This is a local net tool, unless you //want// to send your shopping list to the internet, hosting on a Droplet or AWS tiny adds no user journeys (if that is true, Amazon wish lists already exist).  
- Small installation footprint, negligible CPU usage when backgrounded, quite low when active
- No marketing or 3rd party platforms involved, as unneeded in narrow scope.   
- Types allow extendable data and features.   This concept is abit over-engineered, as though I was thinking in languages with better type systems. . . . I am.  
- Like Google todo list app, there is no id/ account /login / auth steps in the app.  You are an anon local user.  I never know that you exist.  Note: NPM might know the person that installed the app exists.  


### Data caching


- There is an install thread that caches the code into your phones Caches object for offline use.  Not needed for use if you have a Wifi connection to the server.
- There is a fairly standard API accessible via /api/*, using JSON. #blah
- There is a network wrapper in a Worker thread that attempts to ensure user sync requests are performed to this API.  This class doesn't hold data.   Data may be transitorily held in buffers between the threads.
- There is an optional LocalStorage cache, that can hold data between app restarts if there is network isolation
- The text items are stored in a localisation cache (that could be a config file).
- There is a memory cache called DataCache that holds the most current data from the above data items.
- For testing, I can load fixtures into the data cache as a different run mode
- There are references to the data cache in all the components.  I believe this last line is in sync with the data cache.


### To use


- Clone repo to a big screen device
- Read the file, then Run build-tools/checksum.bash  this creates certs and runs `npm i` twice
- OR run `npm i` in each package directory, and build your own certs (maybe from **Letsencrypt**?) 
- run `npm run build:app`
- run `npm run app`
- launch on phone or desktop and build your initial lists (labour-intensive here)
- Use the install feature on phones, if you think the app is useful including the time typing.
- Nag me for JSON import from XYZ other platform capacity
- Think about scan barcode on older packet https://www.actowizsolutions.com/uk-grocery-api-real-time-data-tesco-aldi-asda-sainsburys.php

- Advanced use: read TODO list
- Think about creating a 'home page link' if the tools is useful see [https://support.google.com/chrome/answer/9658361?hl=en&co=GENIE.Platform%3DAndroid] [https://support.google.com/chrome/answer/15085120?hl=en&co=GENIE.Platform%3DAndroid].  This is 2 taps, and not automatable for security reasons. 
- To be able to delete the installed version please scan [https://support.google.com/chrome/answer/2392709?hl=en&co=GENIE.Platform%3DAndroid&sjid=5819306311445701255-EU#zippy=%2Cdata-that-doesnt-get-deleted%2Cdata-that-can-be-deleted].  I think purge/ delete capacity should be outside the app, so you don't run an app you just removed. 
- WARN: DO NOT edit code-base without an IDE. (I'm  using glyths that are not found on a EN-US keyboard, so you need auto-complete).   Config/ Constant files are in ASCII 127 to be be more broadly compatible.   


### Basic file system


- $root/
	- build-tools
		- bash scripts 	~ maybe port to Python later
	- common
		- code directly used by both sides
		- types 
	- client-src/
		- .storybook	~ these are config for storybook tests
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

As a data architecture, my components should have:
- a stateKey that is an easy summary of current state, so Vue can see if the state has changed cheaply
- a testId for every HTML element that may need to be directly accessed (mostly used in tests).  This mean multiple testId per component.


### Warnings / Caveats


- I am not accountable or responsible for anything NPM decides.   Do not run it as root or admin.  
- Due the way that security theatre and SSL are designed, "low risk" URLs local to your own hardware will require fiddling to be accessed.  Browsers are not happy with HTTP, or HTTPS self signed for good general reasons.  However this doesn't make sense for local domains.  Some browsers often do not read the local hosts file to eliminate virus's on win32.   As a casual app-dev on the outside of those projects, I can document known work-rounds and no more.   
   - TODO: use letsEncrypt to avoid this point.
- If you talk HTTP/0.9 or HTTP/1.0, or HTTP/1.1 to the API you get TCP transit, and nothing on higher protocols.  This is HTTPS and HTTP/2 only service, your browser should default to HTTPS and ALN upgrade steps.   
- I strongly recommend applying a local domain name to the IP that runs this service, for UX.  Details will vary, please consult your docs.   My router creates a local name for each machine that uses DHCP by default, yours might too. 
- This project likes Node24, absolutely no warranty on older versions as I expect NPM will make your life very hard.  Package.json includes some magic for getting Node24, but that tech is very frail as it moves version of NPM.  #leSigh.
   - Assuming you are a techie, adopt/ deploy NVM to have flexibility.
- For better readability, I moved many local variable names to a non-English lang ~ fr-FR ~ so there is no clash with JS keywords.    Public symbols should be in en-UK.   This convention isn't global, but its not bad spelling.   JS does allow UTF-8 in variable names.
- TS says _LOGGING_ isn't defined in tests.   It is at test runtime.  ''I may be able to resolve this.''   This _LOGGING_ feature is to add test-only logging, that the build step strips.  
- Node supports a different Thread implementation to browsers.  I could make some more of my tests work, but that is adding code to pass test env that cannot be used outside of tests.  This is not productive.
- Build tools will complain "Failed to load source map" for ./client-src/src/assets/foundation.min.css.  Yes this file is absent.  Don't worry.  I may go back to normal package import later.


### User interactions


If this was paid work, I would be using a more graphical and less indexable file, from one of:
* [Figma: The most fancy interaction design tool, running in browser or a native app](https://figma.com "Figma")
* [Mockplus: Another tool I haven't used, no review](https://www.mockplus.com/blog/post/user-journey-map "Mockplus")
* [Balsamiq: The old tool that I find much faster to deliver a basic sketch with](https://balsamiq.com/wireframes/cloud/ "Balsamiq")
* others

I have moved these to a separate file ./USER-INTERACTIONS.md 


