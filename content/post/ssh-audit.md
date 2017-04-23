---
author: mpf
date: 2017-04-23T16:27:37+01:00
keywords:
- ssh
- security
title: SSH Audit - a tool for checking SSH server security
topics:
- security
type: post
---

SSH audit is a cool python-based tool for information gathering and auditing
SSH services, it can fingerprint services based on the presence of supported
features and server banners and also gives recommendations to help improve
your server's security. The functionality itself is interesting, but digging a
bit into the internals reveals some cool fingerprinting ideas.
[SSH audit](https://github.com/arthepsy/ssh-audit) is an excellent tool for checking the security of SSH services, 
either during client engagements or for server hardening. 
I found it while looking through recently updated [homebrew](https://brew.sh/) formula, 
and it's written in python so should run on just about anything.

The script itself uses a variety of interesting techniques to examine a specified server, 
things like looking at [banners](https://github.com/arthepsy/ssh-audit/blob/master/test/test_banner.py)
(which can give a huge amount away, down to OS point releases), 
and supported encryption, MAC, key exchange (kex in SSH-land), and host-key algorithms.

## Auditing

After installation, running the script is simple, just use `ssh-audit hostname`, 
or try `-h` for other options. 
Here's the output of running it against `scan-me.nmap.org`:

![](/images/posts/ssh-audit.png)

As you can see there are plenty of recommendations, 
and the [full output](https://gist.github.com/mattfoster/756c6e6eb81e2099f902be3ffa5515d2) has them summarised at the end too, making skimming easier.
SSH security is interesting and fraught with pitfalls, because there's little evidence that it's actually vulnerable to most modern crypto problems.
For example [sweet32](https://sweet32.info/) affects ciphers with 64-bit blocks, like blowfish and 3DES, both of which are supported by many SSH versions. 
However, this attack requires analysing a lot of traffic transmitted with the same key (see the website and paper), and SSH clients have a tendency to frequently re-key. 
Similarly, MD5 and SHA1 are not yet proven to be unsafe when used with [HMAC](https://en.wikipedia.org/wiki/Hash-based_message_authentication_code), and 
same elliptic curves have been called unsafe by [some people](http://safecurves.cr.yp.to/rigid.html), but are still in wide use.

In my view, things like this mean that hardening SSH server configuration isn't likely to be of critical importance, 
but as with most things it's probably only a matter of time before the highlighted issues *do* become real problems, so you should do it now anyway. 

## Internals

In my view, one of the most interesting bits of the script is the way it does behaviour based fingerprinting.
If you look at the [source](https://github.com/arthepsy/ssh-audit/blob/e42064b9b9c5e630574d306c1f349a1ff0bc1d6a/ssh-audit.py#L1347) 
you can see that the author has added a way to tag when certain features appeared and disappeared in OpenSSH, libSSH and Dropbear. 
For example:

```
'diffie-hellman-group1-sha1': [['2.3.0,d0.28,l10.2', '6.6', '6.9'], [FAIL_OPENSSH67_UNSAFE, FAIL_OPENSSH70_LOGJAM], [WARN_MODULUS_SIZE, WARN_HASH_WEAK]],
```

Which generated this in my example scan:

```
(kex) diffie-hellman-group1-sha1            -- [fail] removed (in server) since OpenSSH 6.7, unsafe algorithm
                                            `- [fail] disabled (in client) since OpenSSH 7.0, logjam attack
                                            `- [warn] using small 1024-bit modulus
                                            `- [warn] using weak hashing algorithm
                                            `- [info] available since OpenSSH 2.3.0, Dropbear SSH 0.28
```

I find this sort of fingerprinting behaviour fascinating, and can really appreciate the amount of effort that must have gone into poring over changelogs and software to generate the rules here. 
[LibSSH's ChangeLog](https://github.com/substack/libssh/blob/master/ChangeLog) file, for example contains almost no details of the type that could have been used here, so maybe the author tested it by hand?

## Overall

SSH Audit is a fascinating piece of software which could help you both harden your SSH services and see how you might go about implementing behaviour based fingerprinting of SSH services.
It currently supports libSSH, OpenSSH and Dropbear.
Check it out.

