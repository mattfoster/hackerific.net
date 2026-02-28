---
author: mpf
date: 2017-05-27T21:05:11+01:00
keywords:
- meta
- jsonfeed
tags:
- json
- two
title: Hopping on the JSON Feed bandwagon
type: post
---

Anyone who's tried to use RSS knows just how fiddly it is, and these days JSON is the _de facto_ format
for most things on the web.
So -- like a lot of people -- I read the announcement of
[JSON Feed](https://jsonfeed.org/) with great interest and decided to add a
new feed to my site.

Like all good lazy engineers the first thing I did was search the web and find some decent resources, including
a couple of blogs belonging to people who have already beaten me to it.

* [Ascraeus - JSON Feed](https://ascraeus.org/jsonfeedarticle/)
* [Raymond Camden - Creating a JSON Feed for Hugo](https://www.raymondcamden.com/2017/05/18/creating-a-json-feed-for-hugo/)

I'm still a bit of a noob when it comes to Hugo, and found that a combination
of the template in the first page and some of the information in the second
were exactly what I needed - I do reserve the right to keep on tweaking though :)

You can find the two commits I ended up with, on Github:

* https://github.com/mattfoster/hackerific.net/commit/e776d9c3457ee60245ff2bb19da9b791c9dd0632
* https://github.com/mattfoster/hackerific.net/commit/1320cdda492a9b478cb83bee2b23b1931a72e76a

Basically, I added a template file (`layouts/index.json`) and an `[outputs]` section to my config file:

```
[outputs]
    home = [ "HTML", "JSON", "RSS"]
 ```

Then, I added a link to the JSON Feed in my template, so you'll see this in the top of the index page:

```
<link rel="alternate" type="application/json" href="https://hackerific.net/index.json">
```

That, along with making sure Hugo was upgraded to `0.20` is pretty much
everything, and my final action was to subscribe to my new feed in
[Feedbin](https://feedbin.com/), my feed reader of choice.

If you use a reader with JSON Feed support, feel free to subscribe using
[https://hackerific.net/index.json](https://hackerific.net/index.json) but not
that I might tweak things.
