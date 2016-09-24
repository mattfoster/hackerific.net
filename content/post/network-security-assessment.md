---
author: mpf
date: 2016-09-24T08:57:03+01:00
keywords:
- security
- scanning
- book
tags:
- security
- two
title: 'Review: Network Security Assessment (3rd edition)'
topics:
- security
type: post
---

Not long ago, I joined the [O’Reilly Security Newsletter](http://www.oreilly.com/security/newsletter) (which I highly recommend by the way), and was given the choice of one of several free eBooks. I went for [Network Security Assessment (3rd edition)](http://shop.oreilly.com/product/0636920034490.do) and wasn’t disappointed. This book is a short review, listing some of the things I enjoyed about it.

Despite being unfinished, this is a mature and captivating book about examining networks for vulnerabilities. I work daily on the concepts covered in this book and I can imaging that when it's finished it will be a go-to book on my shelf (yeah, I'll probably buy a physical copy).

There's a lot here about scanning and finding vulnerabilities, but with a doubt, my favourite bits are the nuggets of knowledge that come from first hand experience. I'm talking about things like how to identify Java application servers by the content of their `JSESSIONID` cookies, and all of the handy examples scattered through the text. As someone who spends a significant amount of time maintaining security scanning software, I live and breathe this kind of tip, and I found myself making notes and highlights the entire time I spent reading it. (As an aside, make you you check out [wafW00f](https://github.com/EnableSecurity/wafw00f/), if you're interesting in fingerprinting web servers by their behaviour.)

One of the things you'll noticed is that there's no doubt that this is still very much a work in progress. To start with, half the images are missing, and the chapter list currently on [O'Reilly's](http://shop.oreilly.com/product/0636920034490.do) site is also pretty wrong. For example, there’s nothing about VPNs in the book yet, despite it being listed online. Still, I wouldn't let that put you off, because buying the book will get you updates, and the finished version when it's done. This is also not the type of book you'll read once and then forget about, because it's too packed with tips and will make a handy reference.

Some interesting ideas I picked up while reading the book include:

* Rate limiting requests with repeated security tokens (e.g. session cookies, tokens or anti-CSRF nones). Doing this could help defend against Lucky 13 and RC4 byte bias attacks (and presumably SWEET32 now).
* Enumerating IPv6 hosts using [dnsdict6](https://github.com/mmoya/pkg-thc-ipv6) and friends
* Brute forcing HTTP hostnames using metasploit’s `vhost_scanner`, and wordlists.

All of these things are fairly simple concepts, but having them all presented in once place, along with examples, amplifies their usefulness and I’m really looking forward to this book being finished so I can see more!

Some things I really hope to see covered include:

* Assessing VPN security (this is in the chapter list, so I'm looking forward to it), including IKE stuff and OpenVPN etc.
* Assessing SSH. It's pretty hard to find good advice on what's considered secure these days with SSH. For example, there are plenty of posts on upgrading keys and disabling certain HMACS (MD5, anyone), but I've not seen any concrete advice on what can realistically be attacked. 
* Testing HTTP/2 services. This is still pretty new, but a lot of software now supports HTTP/2, so people need to test it!

But actually they'll all make for interesting blog posts, so watch this space. 

