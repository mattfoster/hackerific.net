---
title: "Rad[io] Links 2: May 2020"
date: 2020-05-11T14:44:09+01:00
tags:
 - radio
 - electronics
---

I enjoyed compiling [last month's Rad[io]
links](/2020/04/15/radio-links-1-april-2020/) (silly name aside!) and I've been
trying to keep up the pace with posts. I've stopped using google analytics, so
I don't have much idea how popular the last post was, but whatever :shrug:!
Here are a few more interesting items I've found over the last few weeks.

## So. You Bought A VNA. Now What?

By now, most people have heard of the
[nanoVNA](https://github.com/ttrftech/NanoVNA), the tiny touch screen vector
network analyser you can get for very little money. If you don't have one,
order one now then come back. I'll wait :grin:

This [hackaday](https://hackaday.com/2020/04/23/so-you-bought-a-vna-now-what/)
post has some great info on the basics of how they work but doesn't mention
software! In my opinion [NanoVNASaver](https://github.com/mihtjel/nanovna-saver)
transforms the VNA from a tiny toy with terrible controls into something far
more usable. All you need to do it plug it into a computer, and can you benefit
from a big screen and proper graphs.

If you're after something more scalar, then look at the
[Antuino](https://www.hfsignals.com/index.php/antuino/), by the maker of the
BITX. This uses an Si5351 oscillator and a superhet receiver to measure antenna
or circuit responses at exact frequencies, so it's pretty cool, but you don't
get the complex impedance information you'll get from the nanoVNA.

## Bottle transmitter (De flessenzender)

In 1953, a storm and very high spring tide caused [massive
flooding](https://en.wikipedia.org/wiki/North_Sea_flood_of_1953), primarily in
the Netherlands, but also in parts of England and Belgium. Radio amateurs came
to the Belgium's rescue and helped organise an emergency radio network.
Perhaps unsurprisingly, this is commemorated each year on the anniversary.

While I was reading the [GSRP club]() [mailing
list](https://groups.io/g/gqrp/message/58215) the other day, PA3BCB (and
others) mentioned the fascinating story of Peter Hossfeld, a technician at a
radio shop, who actually wasn't a ham.  He built an 80m emergency tube-based
transmitter in a single night, using a wine bottle as a former for a coil, and
a light bulb to help tune the output. He then used this to relay messages the
next day! There's more info on this fascinating story at [PA3ESY's
site](https://translate.google.com/translate?hl=&sl=nl&tl=en&u=https%3A%2F%2Fwww.pa3esy.nl%2Fzelfbouw%2FWatersnoodzender-1953%2Fhtml%2FWatersnoodzender_set.html),
and the Dutch SRS held a competition to [build
replicas](https://translate.google.com/translate?sl=en&tl=la&u=https%3A%2F%2Fwww.pi4srs.nl%2Fwp%2Fde-flessenzender%2F)
in 2019. I'm sure there's way more about on this, but my tolerance for google
translated text is fairly low!

## Window mounted Log spiral antenna

[This](https://www.tindie.com/products/hexandflex/300mhz-log-spiral-antenna-with-suction-mounts/)
ultra-wideband omni-directional antenna comes complete with suckers to stick it
on a window and has a frequency range of "300MHz to ~3GHz and beyond". There's
a lot of [design
information](https://hexandflex.com/2018/09/29/spiral-antenna-part-1/) on the
[HexAndFlex](https://hexandflex.com/) blog, as well as some stuff on the
nanoVNA, so it's worth a look. I imagine antennas like these would work really
well with SDRs.
