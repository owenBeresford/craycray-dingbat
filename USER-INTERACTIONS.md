These user journey sketches are not focussing on motivation strongly, as this is a OSS shopping list tool.  
There are no _Lieder_ or _grandes épopées_ involved.  No wigs or swooning and falling of balconies. 

### User journeys

- User1 is a nominal "normal person", who wishes to have low friction information management.  They have been sent the link installed by user2.
- user1 starts to use app by checking Wifi is active and opening supplied URL in their phone.
- Sees some initial context help, likely skims, but closes as it doesn't look complex.
- Sees lists
- Taps on a button to open a list.
- Plays with swiping
- Tries a long tap, and gets edit item feature
- Looks at burger menu
- Closes the App

-----
- user2 actually uses app by opening it.
- Starts a new list with the 'new list' button.
- Then spends 30min browsing cupboards, and adding items to list as necessary.
- Hits 'save' in the menu to persist this list; does not close the App
- Engages transport to get to shops.
- Buys items, and swipes the items off.
- Closes app without saving it, so shortened swiped list isn't persisted.

-----
- Next week, user2 opens the App, 
- Sees the list of lists on loading; then opens the list they made previously.
- Repeats shopping process

-----
- user1 returns to the App, and builds a Christmas shopping list.
- Then enters a _sensible_ name and saves it.

----
- user1 knows they entered an item, but has lost it. 
   - This is a point of friction on freeware from 'Driod.
- They use the search feature on the main tabBar as it seems relevant to their needs.
- This supplies a new list of items that match that search term. 
   - Each result includes a link back to the original list.
- This finds their lost item,
- They enter the original list, and swipe the item, so no-one can see it.
- They save this list, and close the app.
- The new results list could be saved, although its recommended to enter a meaningful name first. 

-----
- Several months later; user1 goes Xmas shopping with the handily saved list

-----
- User3 has reasonable vision, although wears reading glasses or they get tired quickly.  They are however partially deaf.
- User3 has no problems using this app, as it doesn't involve any sound. 
- They gain as there are no ads in the app, or delays doing anything (see electron slowness). 

-----
- User4 has strong long sight, and cannot focus on close things at all.  They use a tablet as an outsize phone, or a big screen device.  
- Assuming the service is deployed locally for them, the app should work as normal on a tablet.  Or if they need a volume of data entry, a big-screen device is also an option.
- Note this solution is outside of this app capacities, but quite likely to happen.   

---- 
- User5 has poor motor-control due to lead poisoning and hates small fiddly screens or inputs.   As a side effect do not have great handwriting, and prefer a full keyboard for data management.
- Assuming the app is deployed, they can use the features via a big-screen device.
   - TODO test keyboard approach abit more thoroughly.   
> [!iWARN]
> Note: I cannot properly automate keyboard inputs in JS for security reasons.

-----


### Interactions / components

I haven't made "proper" wirefames or interaction maps, as the process is "follow the interaction process of everybody else".   The best interaction design is the one users do not notice as they had no friction or learning at all.   Beige for user effort is a good interaction.  
- As this is an App, there are no internal links (eg Anchor element).   
- The things that look like buttons should behave like buttons.   They should support touch, mouse or keyboard inputs.  They should support all the HCI guideline items in normal fashion.   
- The things that look like a menu should behave like menus (without auto-close as that doesn't help mobile).   On mobile they should scale relevantly, so are readable.
- As a mobile app (for most usage) this app supports swipe, and this should behave as normal.  It should follow normal HCI guidance for this.   
- Interactions can be reverted by using the "revert all" menu option.   This will return to your last persisted state on the server.  This is expected to be when you are are at home, on Wifi, and no deleting things.  Note, technically this is ignorant about other users actions during the time since your last persist.    
- There is an "install" feature.  This should copy the static code to your local phone cache.   The App runs inside your normal browser (many apps do this vis Electron, but this approach has less *theatre involved).
- _The wording in the UI is likely to evolve, and I think is important for user interactions._   

