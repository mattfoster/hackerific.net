---
author: mpf
date: 2016-04-22T08:18:14+01:00
tags:
- launchbar
- mac
- applescript
title: Launchbar 6 Bookmarklets
topics:
- launchbar
- mac
description:
>
  Launchbar actions for browsing Pinboard are pretty much covered, but I
  couldn't find any actions to save them in the way I want, so set about writing
  my own. This post covers my mini AppleScript adventure using Launchbar 6's cool
  Action Editor.
type: post
---

Launchbar actions for **browsing** Pinboard are pretty much covered, but I
couldn't find any actions to save them in the way I want, so set about writing
my own. This post covers my mini AppleScript adventure using Launchbar 6's cool
[Action Editor](https://www.obdev.at/products/launchbar/actions.html).

![The Action Editor](/images/posts/action_editor.png)

## Background

I don't really use the bookmark functionality built into web browsers, instead
opting to either just search the web for sites I need to revisit, or store them in
[Pinboard](https://pinboard.in/u:mattfoster), an online bookmarking service. 

I also use [Launchbar](https://www.obdev.at/products/launchbar/index.html), a
highly-extensible launcher and general purpose app for doing **things** on Macs.
So, adding the ability to save bookmarks to Pinboard, using Launchbar seemed
like a fairly obvious step. A step which would also give me the chance to play
around with extending Launchbar.

## Mission

The goal of my mission was to create a way to use a Launchbar action to take
the current URL loaded in Safari (or Chrome, and ideally also Firefox or any
other browser), and save it in Pinboard. Bonus points would be awarded for
allowing me to add a note, and tags.

I quickly realised that what I wanted was the popup bookmarklet listed on
the Pinboard [howto page](https://pinboard.in/howto/). i.e., this:

![Pinboard popup](/images/posts/pinboard_popup.png)

So I set about trying to open the bookmarklet in Safari, using AppleScript.
The first useful resource I found, was 
[Die, bookmarks bar, die](http://www.robjwells.com/2013/11/die-bookmarks-bar-die/)
which is a post about opening bookmarklets using older versions of Launchbar.
In fact, the post talks about adding a folder of AppleScript files to
Launchbar's index, and using them to open bookmarklets. This would probably
work in LB6, but I didn't try it. Instead, I tried the following AppleScript snippet
in the Script Editor:

```
tell application "Safari"
  set bookmarklet to "alert(document.location)"
  set current_tab to the current tab of the front window
  do JavaScript bookmarklet in current_tab
end tell
```

When I hit the run button, Safari popped up an alert box
containing the URL of the page loaded in Safari's frontmost tab. Perfect.

![Safari Alert box](/images/posts/safari_alert.png)

The next step was to work out how to do this with the Pinboard bookmarklet,
using Launchbar. Luckily, LB6's [developer docs](https://developer.obdev.at/launchbar-developer-documentation/#/implementing-actions-applescript)
are comprehensive and useful, so I quickly figured out I needed a `run` handler, 
the example in the docs is:

```
on run
    display dialog "No argument was passed to the action"
    return [{title:"This is a result item"}]
end run
```

and if you don't need it, you can omit the `return`. Handy.

So, I made a new Launchbar Action in the Action Editor by filling out the basic
details in the General pane, then, in the Script pane, I chose AppleScript as
the `Default Script`, and hit the edit button, then I added my AppleScript, and
saved:

```
on run
        tell application "Safari"
                set bookmarklet to "q=location.href;if(document.getSelection){d=document.getSelection();}else{d='';};p=document.title;void(open('https://pinboard.in/add?url='+encodeURIComponent(q)+'&description='+encodeURIComponent(d)+'&title='+encodeURIComponent(p),'Pinboard','toolbar=no,width=700,height=350'));"
                set current_tab to the current tab of the front window
                do JavaScript bookmarklet in current_tab
        end tell
end run
```

Which worked from in Launchbar! So, my next step was to work out how to add
support for Chrome too. 

I found [an article](http://daringfireball.net/2009/01/applescripts_targetting_safari_or_webkit) 
on Daring Fireball, about generalising AppleScripts to work with both WebKit
and Safari. The post was a bit dated, but still had some usable info which I
was able to use in my script. Unfortunately, Chrome is no longer based on WebKit
so the statement `using terms from application "Safari"` no longer works,
and I was forced to write browser specific code. After a bit of reading
fiddling, I ended up with the following:

```
-- Based on http://daringfireball.net/2009/01/applescripts_targetting_safari_or_webkit
on GetCurrentApp()
	tell application "System Events" to ¬
		get short name of first process whose frontmost is true
end GetCurrentApp

on GetDefaultWebBrowser()
	-- First line of _scpt is a workaround for Snow Leopard issues
	-- with 32-bit Mac:: Carbon modules
	set _scpt to "export VERSIONER_PERL_PREFER_32_BIT=yes; " & ¬
		"perl -MMac::InternetConfig -le " & ¬
		"'print +(GetICHelper \"http\")[1]'"
	return do shell script _scpt
end GetDefaultWebBrowser

on run
	set bookmarklet to "q=location.href;if(document.getSelection){d=document.getSelection();}else{d='';};p=document.title;void(open('https://pinboard.in/add?url='+encodeURIComponent(q)+'&description='+encodeURIComponent(d)+'&title='+encodeURIComponent(p),'Pinboard','toolbar=no,width=700,height=350'));"
	set _browser to GetCurrentApp()
	if _browser is "Safari" then
		tell application "Safari"
			set current_tab to the current tab of the front window
			do JavaScript bookmarklet in current_tab
		end tell
	else if _browser is "Chrome" then
		tell application "Google Chrome"
			execute front window's active tab javascript bookmarklet
		end tell
		
	end if
	
	return [{title:"Saved in " & _browser}]
end run
```

This works by using either Safari or Chrome (or trying the default if neither
is in focus). It notably won't do anything in Firefox or Opera though. So now,
when I want to save a bookmark in Pinboard, if I'm in either Chrome or Safari,
I can just start typing `Save Link`, and select it to save it. 

As an aside, it also contains the interesting perl snippet:

        VERSIONER_PERL_PREFER_32_BIT=yes perl -MMac::InternetConfig -le 'print +(GetICHelper "http")[1]'

Which uses a 32-bit perl library to get the current user's default browser.
I've no idea why there's no 64-bit version!

Anyway, mission accomplished!

![Launchbar](/images/posts/launchbar_pinboard_save.png)
