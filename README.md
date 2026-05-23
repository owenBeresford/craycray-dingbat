

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
- Think about creating a 'home page link' if the tools is useful see [https://support.google.com/chrome/answer/15085120?hl=en&co=GENIE.Platform%3DAndroid] 
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


### Warnings / Caveats


- I am not accountable or responsible for anything NPM decides.   Do not run it as root or admin.  I do not have any control on that tool.   
- Due the way that security theatre and SSL are designed, "low risk" URLs local to your own hardware will require fiddling to be accessed.  Browsers are not happy with HTTP, or HTTPS self signed for good general reasons.  However this doesn't make sense for local domains.  Some browsers often do not read the local hosts file to eliminate virus's on win32.   As a casual app-dev on the outside of those projects, I can document known work-rounds and no more.   
- If you talk HTTP/0.9 or HTTP/1.0, or HTTP/1.1 to the API you get TCP transit, and nothing on higher protocols.  This is HTTPS and HTTP/2 only service, your browser should default to HTTPS and ALN upgrade steps.   
- I strongly recommend applying a local domain name to the IP that runs this service, for UX.  Details will vary, please consult your docs.   My router creates a local name for each machine that uses DHCP by default, yours might too. 
- This project likes Node24, absolutely no warranty if you attempt to run on older versions as I expect NPM will make your life very hard.  Package.json includes some magic for getting Node24, but that tech is very frail as it moves version of NPM.  #leSigh.
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


