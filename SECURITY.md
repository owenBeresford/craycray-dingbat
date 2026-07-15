’’There is no such thing as security, there never has been’’. 
    ~ [Germaine Greer](https://www.thoughtco.com/germaine-greer-quotes-3530088) ~ has no PhD in CompSci, and *still not wrong*.    
.
If you see any security errors please [raise a fault in github](https://github.com/owenBeresford/craycray-dingbat/issues)
.


### Security review


* SPEC: The server is only to be run on LAN IP.
* My client-side JS only loads assets that are from the same server. 
* There are no 3rd party assets (eg social media etc)
* All access to the app is a inside HTTPS, exclusively.  The operational certs can be EC for additional security.
* Comms are HTTP2, even when this is hard. 
* REPEAT: There is no access restrictions, as this is designed PURELY to be a LAN service.
   * However, please secure your LAN (out of scope to this project).  
* THEREFORE There is no pathway for data to flow from {what you enter to this app}, and {other organisations on the internet}.   
* As this is OSS, you can read the source to confirm this.


* TODO: adding more integrity HTTP headers
* .
* Nothing new learned in these links: 
  * https://aptori.dev/blog/javascript-security-a-secure-coding-checklist-for-developers
  * https://raygun.com/blog/js-security-vulnerabilities-best-practices/


