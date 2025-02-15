---
title: "Restic on Linux"
date: 2025-02-15T10:00:00Z
created: 2025-02-15
keywords:
- linux
- systemd
- restic
- backups
tags:
- linux
---

I was thinking about DIY backups recently and found
[restic](https://restic.net/), a modern backup program which seems pretty
good. One interesting thing about it is that unlike borg -- which might be
the market leader in this space currently -- there aren't that many ready-made
tools, suggesting you're expected to set it up yourself (and that maybe it's a
fairly young project). Well, I did that on my Debian VPS, and here's what I
ended up with.

First off, I'm using Debian 12 and installed the latest available restic version,
which was 0.14 (so a few releases behind as you'd expect from a stable distro):

```
~ % apt list restic
Listing... Done
restic/stable,now 0.14.0-1+b5 amd64 [installed]
```

Restic has great docs, including a [quickstart guide](https://restic.readthedocs.io/en/stable/010_introduction.html#quickstart-guide)
which is worth reading. The gist is that you create and initialise a repository
and set a password, and you can pass these two parameters using environment
variables or command line arguments. I decided to use
[BorgBase](https://www.borgbase.com/) to store my backups meaning my
repositories would be remote, and so I just needed to write some systemd units
and add some health monitoring. I'm a big believer in paying for important
things I can't easily do better myself, and borgbase is a bargain.

### Units 

systemd's units are the main reason I like using it. As someone who has written
their fair share of init scripts over the years I really appreciate the
simplicity and feature richness I can get with zero faff. I ended up with this:

`/etc/systemd/system/restic@.service`

```
[Unit]
Description=Restic backup of %I
After=network-online.target

[Service]
Type=oneshot
User=restic
ExecStart=restic backup --files-from /etc/restic/%I.files --repository-file=%d/restic-repo --password-file=%d/restic-password
AmbientCapabilities=CAP_DAC_READ_SEARCH

[Install]
WantedBy=multi-user.target
```

And with `/etc/systemd/system/restic@.timer`:

```
restic@.timer
[Unit]
Description=Run Restic daily

[Timer]
OnCalendar=daily

[Install]
WantedBy=timers.target
```

Finally, I created `/etc/restic/hackerific.files` with a list of files to
include in my backup. I'll explain the `%d` parts below:

### Storing Secrets

While researching this project, most articles I found about setting this up
used convoluted scripts or environment variables to pass the repo and password
to restic, even the [Arch Wiki](https://wiki.archlinux.org/title/Restic#Systemd_service) 
but I'd been eyeing up `systemd-creds` for a while and knew there was a better
way using that. `systemd-creds` is specifically designed to pass credentials to
units, via files, and restic's support for files containing these meant it was
ready to go. This is documented in [CREDENTIALS](https://systemd.io/CREDENTIALS/).

Debian 12 ships with `systemd-creds` which means there's no need to mess about
with storing keys in variables as you can encrypt them on disk (on something
other than a VPS -- or on a better VPS -- that storage might ultimately be
backed by a TPM, but on my Linode it wasn't).

```
~ % systemd-creds has-tpm2
partial
-firmware
-driver
+system
-subsystem
```

As with the rest of the systemd project, the [man page](https://www.freedesktop.org/software/systemd/man/latest/systemd-creds.html) is great, and full of examples. 

I used:

```
# mkdir /etc/systemd/system/restic@.service.d/
# systemd-ask-password -n | ( echo "[Service]" && sudo systemd-creds encrypt --name=restic-password -p - - ) >/etc/systemd/system/restic@.service.d/50-password.conf
# systemd-ask-password -n | sudo systemd-creds encrypt --name=restic-repo -p -- >>/etc/systemd/system/restic@.service.d/50-password.conf
```

Which is based on the examples in the docs, and was automatically loaded into
my unit by systemd. Next, I added the arguments to my command:

```
ExecStart=restic backup --files-from /etc/restic/%I.files --repository-file=%d/restic-repo --password-file=%d/restic-password
```

And did some initial tests (`systemctl start restic@hackerific.service`),
satisfied myself it worked and moved on to looking at health checks.

### Monitoring

Having a cron (systemd timer) is great but at some point something will break,
and it would be great to know when that happened. To get around this I decided to look at 
[healthchecks.io](https://healthchecks.io/), a system which you can configure
to generate warnings if a certain amount of time happens without an alert. This
is a great (and free) service that's worth a look. 

I found [this great blog
post](https://passbe.com/2022/healthchecks-io-systemd-checks/) which describes
a way to do this in systemd and copied that more of less exactly, by making a
project in healthchecks.io and grabbing the UUID. You can find the systemd unit
on
[gihub](https://github.com/mattfoster/linux-config/blob/main/systemd/healthcheck%40.service).

Then I plumbed it into my restic service using `OnFailure` and `OnSuccess`, like this:

```
OnFailure=healthcheck@<healthcheck-token>:failure.service
OnSuccess=healthcheck@<healthcheck-token>:success.service
```

This works by passing the token at `:failure` or `:success` to the unit, which
tells the healthcheck it has started and then finished (or failed) and sends
some logs.

To ensure you get the alerts you expect you can tell healthchecks.io how often
you expect it to be pinged by setting a schedule in the config on the website.

## Pruning

With that all done and working I decided to look at pruning. I'm still working
on this, and there are great arguments to making totally immutable backups
(especially ransomware resilience), but for now I have used the same techniques
as I described earlier to create a unit which prunes my snapshots. I'm
currently using `restic forget --keep-daily 7 --keep-weekly 4 --prune` which
means I end up with 7 days of hourly backups, another week of daily backups and
then one a week for 4 weeks. I'm not 100% happy with this, so I'll probably
tweak it in future. You can find the unit on
[github](https://github.com/mattfoster/linux-config/blob/main/systemd/restic-prune%40.service)/

## Conclusion

This was a fun project which shows some of the power of systemd, and some fun
online services. I'm currently pretty satisfied this is working as expected,
and I've put all my unit files [on
github](https://github.com/mattfoster/linux-config/tree/main).
