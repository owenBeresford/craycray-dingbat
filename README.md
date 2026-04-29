
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
* Write some code tat people can see, its not ground breaking.
WARN: to-date not actually ran this yet.

## to use
* clone repo to a big screen device
* run `npm i`
* run `npm run build:app`
* run `npm run app`
* launch on phone or desktop and build your initial lists (labour-intense here)
* Nag me for JSON import from XYZ other platform capacity

* Advanced use: read TODO list

### User interaction (draft grade)
If this was paid work, I would be using a more graphical and less indexable file, from one of:
* [https://figma.com Figma]
* [https://www.mockplus.com/blog/post/user-journey-map Mockplus]
* [https://balsamiq.com/wireframes/cloud/ Balsamiq]
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


