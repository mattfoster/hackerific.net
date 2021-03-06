---
tags:
- radio
- bluetooth
date: 2012-01-28T00:00:00Z
title: Spectrum Tools and Ubertooth One
url: /2012/01/28/Spectrum-Tools-and-Ubertooth-One/
---

In the last year or so there's been a fair amount of coverage of the excellent
[Ubertooth](http://ubertooth.sourceforge.net/ "Project Ubertooth - Home")
project. 

Ubertooth One is an open source 2.4 GHz experimentation device, designed for
messing with <a href="/tags.html#bluetooth">bluetooth</a>, but with a lot of 
flexibility which gives rise some other very cool features, like spectrum
monitoring.

I installed the Kismet [Spectrum-Tools](http://www.kismetwireless.net/spectools/ "Spectrum-Tools") on a [Backtrack](http://www.backtrack-linux.org/ "BackTrack Linux - Penetration Testing Distribution") Linux box to play with, and thought I'd share a brief <a href="/tags.html#howto">howto</a>, along with some images.

## Building

Spectrum-Tools is available via apt, but as is often the case, the available version is too old to have Ubertooth support. 

So, first off, let's install a recent version of the Spectrum-Tools. Running

    svn co https://www.kismetwireless.net/code/svn/tools/spectools 

Will grab the latest version of the source code from Kismet's subversion repository. 
Next, check the [README](https://www.kismetwireless.net/code/svn/tools/spectools/README), for information on dependencies, and install them. On BT5, I ran:

    apt-get install libgtk2.0-dev libusb-dev
	
On Debian-based systems you'll probably need to prefix that with `sudo`. You'll also need a working build environment, so run:

    apt-get install build-essential 
	
To install a pretty useful meta-package containing most build tools you're likely to need.

Now, `cd` into the `spectools` directory, then type go through the standard (ageless) build process, of:

    ./configure
    make
    make install 
   
To build and install the software. On my BT5 system, the final command installed the binaries into `/usr/local`, which seems to be where most of backtrack's special software ends up.

## Playing

Now that you have Spectrum-Tools installed, it's time to play. The prettiest
thing to play with is `spectool_gtk`, so plug your Ubertooth in, fire it up,
and click `Open Device`.  Next, click `Enable`, and you should be good to go.

If everything worked, you'll see a colourful interface, with three horizontal
panes, showing three different representations of the spectrum, with WiFi
channels at the bottom.  

<a href="http://www.flickr.com/photos/mattfoster/8234348021/" title="spectools by mattfoster, on Flickr"><img src="http://farm9.staticflickr.com/8337/8234348021_b38356a8fd.jpg" width="500" height="310" alt="spectools"></a>

The README file has more information on these different views, but I think the most interesting is the Spectral View, as you can clearly see frequency hopping devices as bright spots:

<a href="http://www.flickr.com/photos/mattfoster/8235410638/" title="spectools-spectral-view by mattfoster, on Flickr"><img src="http://farm9.staticflickr.com/8060/8235410638_cd547584ba.jpg" width="500" height="310" alt="spectools-spectral-view"></a>

If you're trying to decide on a channel to use for you wireless network, you'll probably find the Planar View most useful. This is a more traditional spectrum, and clearly shows how the channels are utilised. The Topo View shows signal peaks over time, and gives similar information to the Planar View:

<a href="http://www.flickr.com/photos/mattfoster/8235410526/" title="spectools-topo-and-planar-views by mattfoster, on Flickr"><img src="http://farm9.staticflickr.com/8477/8235410526_8ae13d68d0.jpg" width="500" height="310" alt="spectools-topo-and-planar-views"></a>

Right clicking on these two graphs lets you toggle a few options. If your
Planar View, is looks too busy, for example, it can be useful to switch of the
current values. 

The Planar View also supports markers, and can show channel masks.  Markers
aren't very well documented (and so this took me a while to work out!). To
active markers, click on an entry in the table on the right, and then _drag_ on
the planar view to drop the marker. To show a channel's mask, click on the
channel number on the legend:

<a href="http://www.flickr.com/photos/mattfoster/8235422850/" title="spectool-planar-view by mattfoster, on Flickr"><img src="http://farm9.staticflickr.com/8488/8235422850_e66e852bbb.jpg" width="500" height="220" alt="spectool-planar-view"></a>
