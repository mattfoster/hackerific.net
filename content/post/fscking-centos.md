---
author: mpf
date: 2016-03-09T18:38:04Z
keywords:
- centos
tags:
- sysadmin
- centos
- fsck
title: fscking CentOS 7!
topics:
- sysadmin
- linux
type: post
---

At work, we’ve recently had problems with one of our SANS, and as a result we
ended up with some filesystem corruption and a little data loss.

As part of our clean-up effort, we rebooted and checked each server, mainly by
running the classic `shutdown -F -r now`, to force a reboot and `fsck`. On
systems where there's little or no damage, this does exactly what you'd expect,
and you end up with the system coming back up happy, but on some CentOS 7
systems where there was corruption this is where the fun began.

Like on all modern Linux systems, if a filesystem check fails you'll be dropped
into a Maintenance Shell (or rather, prompted for the root password, and then
given a shell). This shell is designed to let you do some diagnostics and in
the case of filesystem problems the main thing you’re going to want to do is
run `fsck`. 

On CentOS 7 systems, you’re dropped into something called 
[rescue mode](https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/7/html/System_Administrators_Guide/sec-Terminal_Menu_Editing_During_Boot.html),
which is a systemd unit that does almost everything you want, except:

> In rescue mode, the system attempts to mount all local file systems and start
> some important system services, but it does not activate network interfaces
> or allow more users to be logged into the system at the same time.

That's right, it mounts the filesystems!  This makes it hard to check them,
especially if you have errors on `/var`, which `auditd` uses. In fact, even
using `fuser —k m /var` failed to free the filesystem for unmounting.

I think this is particularly annoying, considering that the one of the main uses
of Maintenance Modes is filesystem repair, so I set about searching the web for
the answer, but despite searching for all manner of things like `centos 7
recovery mode fsck` and `rhel 7 fsck recovery`, I didn't really get anywhere,
until...

Luckily, I found a page on
[systemd-fsck](https://www.freedesktop.org/software/systemd/man/systemd-fsck@.service.html),
which controls the behaviour of `fsck` on startup, and has the snippet:

> fsck.repair=
>      One of "preen", "yes", "no". Controls the mode of operation. The default
>      is " preen", and will automatically repair problems that can be safely
>      fixed. "yes " will answer yes to all questions by fsck and "no" will
>      answer no to all questions.

Perfect! So, you can force the system to `fsck` and repair by appending
`fsck.repair=yes` to the kernel command line in grub. Handy! Hopefully my
posting this will help some poor soul with the same problems as I had.
