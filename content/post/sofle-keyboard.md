---
title: "Building a Sofle keyboard"
date: 2021-04-04
keywords:
- keyboard
- diy
- electronics
- mechboards
tags:
- mechboards
- electronics
---

After considering my options for a little while, I decided to build myself a split ergonomic keyboard.
I'm used to using a 60% board, so my decision making process came down to three main things: 1. what's similar to them and 2. what will work with my Royal Navy DSA v2 keys (i.e. standard key sizes) and 3. what uses QMK firmware? I settled on making a [Sofle](https://josef-adamcik.cz/electronics/let-me-introduce-you-sofle-keyboard-split-keyboard-based-on-lily58.html) board, with a custom layout, tweaked for my left-handed weird typing. 

## Picking

As I said above, I wanted a board a bit like my [60% board](https://github.com/mattfoster/gh60-satan-keymap), and certainly nothing too much smaller. I've played a bit with ortholinear boards but wasn't keen, I and decided that things like the [katana60](http://xahlee.info/kbd/katana60_keyboard.html), while cool, were just not different enough. My colleague [Vasko](https://skozl.com/) has an Iris board which looks close to perfect, except I like the idea of the bottom row being more standardised[^1].

So, with that decided I looked into how to get one, including pricing getting PCBs made from [jlpcb](Https://jlpcb.com). This would have given me the boards and top and bottom plates for about 22 GBP including delivery, so not bad, but I wanted acrylic plates. While I was trying to work out how to get plates I discovered that [mechboards](https://mechboards.co.uk/shop/kits/sofle-kit/) sell kits, so at that point I decided to just get that. In addition to the kit I bought some pro-micro clones and a braided USB cable from Amazon.

## Building

I followed the [build guide](https://josef-adamcik.cz/electronics/soflekeyboard-build-log-and-build-guide.html) and it was pretty easy. I have a cheap hot air soldering station so I used that for the diodes, which sped things up a lot. The other bits just go on as normal, so just take your time and make sure you don't miss any switch sockets (like I did!).

The kit didn't include headers or sockets so I soldered the micros and OLED screens directly to the PCBs. If you are likely to want to switch them out then it would be worth using sockets, but you'll increase the height of the screens, and clone pro-micros are really cheap unless you spring for USB-C connectors.

## Firmware

The first thing I realised when I tried the default layout is that I hit the space bar with my left thumb, so having enter there was a big no! The next thing I noticed is that the arrows were optimised for a right-hander and so on the right half[^2], and then I noticed that I wanted escape at the top left, and tab underneath. From there, I quickly decided to have control where caps lock would normally be and to give myself a `hyper` key on the bottom left. Another oddity is that I rarely use the GUI and control keys on the right, so I decided to leave most of that. Finally, while they are easily togged via the default firmware I like to have GUI (cmd) on the inside, close to space, with alt next.

With all these seemingly arbitrary constraints in place I set about messing with the firmware, and came up with this:

![](posts/soflekeyboard.png)


## Training and muscle memory

I built this a few weeks ago, and while I'm getting better, I'm still not used to using it! Mostly because I'm an awful touch-typist and use the wrong fingers for some letters, and partly because I use my left hand too much! It's not quite my daily driver yet, and when work is not too busy I'm gradually ramping up my use, which is helping a lot. Having to use layers for symbols slows me down a lot, so I'm considering printing a diagram, also, the boards are a lot lighter than my 60%, which has a chunky case, so they don't feel as sturdy and I'm considering getting a metal base cut. But, I'd also like to tilt them if I can work out how... so many options.


[^1]: actually now I've used the Sofle a bit I can see how the positioning on the Iris would be good.
[^2]: I can and do use vim's movement keys a fair amount but only in `vim`. Outside I like `wasd`, since that's what I use when gaming. 

https://mechboards.co.uk/shop/kits/sofle-kit/
https://josef-adamcik.cz/electronics/let-me-introduce-you-sofle-keyboard-split-keyboard-based-on-lily58.html