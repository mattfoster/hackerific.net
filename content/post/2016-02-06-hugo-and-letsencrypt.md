---
author: mpf
date: 2016-02-06T09:31:50Z
keywords:
- SSL
- blog
- Hugo
tags:
title: Hugo and Let's Encrypt
topics:
- SSL
- Hugo
type: post
---

This is a quick post on the static site generator Hugo, which I'm now using to
power hackerific.net, with a little bit tacked on the end about how quick and
easy it was to start using Let's Encrypt to get working SSL certificates for
this site, for free!

These are both excellent projects, definitely work a look.

## Hugo

I've been a fan of static site generators since I first read about
[Jekyll](https://jekyllrb.com/), but I was never completely happy with my
setup. When I started using it things like tagging felt clunky and ill
supported (basically, I had a Rakefile which parsed the YAML front matter and
spat out an HTML page), and because I don't want to faff about with custom Ruby
installs keeping it working on both my MacBook Pro and Debian VPS felt like a
lot of work.

So, like a good hacker I decided that instead of just fixing my existing (admittedly trivial)
problems I'd give myself a load more and move the site to a different generator.

After reading about a few different generators, I settled on
[Hugo](https://gohugo.io/), a generator written in
[Go](https://golang.org/), with some interesting features, notably:

* Super easy setup
* Jekyll import
* A cool live reloading preview mode

Installation was totally painless, on my Mac I used [Homebrew] to install the `hugo`
formula, and on my debian server I didn't install anything, since I'm just
copying over the generated site using [rsync]. If I do want to run it there,
there almost certainly won't be a [debian](https://www.debian.org/) package, so
I'll have to build it from source, or grab a binary.

After the install, I moved onto site creation. To do
this, I used the `import` tool you can find mentioned in the
[Hugo docs](https://gohugo.io/commands/hugo_import_jekyll/). This was largely
painless, with the exception of a few odd posts where it choked on some broken
Markdown, and where I had improperly formatted dates by omitting leading zeros
in a few places. At this point I discovered Hugo's most annoying trait, which
is that its error messages can be a bit cryptic, but it's nothing google can't
handle!

By this time, I had an almost working site, and it was time to start
configuring and styling things.

Hugo has a great [theme library](http://themes.gohugo.io/), but I couldn't find
exactly what I wanted. In the end, I modified the [Hyde Y](http://themes.gohugo.io/hyde-y/)
theme, which is itself a fork of another theme, which is actually ported from Jekyll.

My tweaks returned some of the styling from the previous generation of my site,
like the circuit board background, white, semi transparent backreound, and added another couple of extra
[Font Awesome](http://fortawesome.github.io/Font-Awesome/) icons to the top bar.
Being lazy, I didn't properly fork the theme's repo, so you can find my modded
version in with the rest of the [site's config and posts](https://github.com/mattfoster/hackerific.net).

The result is as you see now. I'm pretty happy with it, and I think the extra
features more than make up for the effort involved in setting it up If you're
making an effort to get back into blogging and feel like freshening up and
existing site you should try Hugo, it's pretty cool.

## Let's Encrypt

Let's Encrypt was born from a desire to encrypt all traffic on the web, and to
make it simple for non systems administrators to do it. I also think it was
born from a desire to shake up and show up the CA industry, in order to force
them to get their collective acts together, and so far I'd say they're doing a
good job!

I was planning to write an entire post on the issuance and setup process, but
Let's Encrypt has done such an excellent job with its tools that it's too
simple to be worthwhile.

I installed the [client](https://letsencrypt.org/howitworks/) and within about 10 minutes I had a working SSL
configuration which scores A+ on the industry standard
[SSL Labs](https://www.ssllabs.com/ssltest/analyze.html?d=hackerific.net&s=178.79.182.85&latest)
test site. That's pretty amazing!

The only functionality currently missing is code for automatic renewals, which
are necessary because Let's Encrypt
[certificates](https://crt.sh/?q=hackerific.net) are only valid for 90 days.
However, an example script is provided, and could easily be added to a cron job.

Overall, I'm really impressed with how slick this project is turning out, and
I'm looking forward to seeing more of the web less open to attacks and
surveillance, so I'd definitely encourage you to give it a go.
