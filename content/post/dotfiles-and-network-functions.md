---
title: "Dotfiles and Network Functions"
date: 2019-12-29T17:17:43Z
tags:
 - zsh
 - network
---
A while back I tidied my [dotfiles](https://github.com/mattfoster/dotfiles)
into a single repo, managed by [chezmoi](https://github.com/twpayne/chezmoi/)
and added a few new functions which I decided are worth sharing. These
functions are designed to make some information gathering tasks easier, so if
you're the type of person who runs `dig`, `whois` or `curl` a lot, then read
on.

## Dotfiles

I've mentioned dotfiles a couple of times before, but in case you've not heard
of them, dotfiles are configuration files, so called because they often start
with a dot, which hides them from standard invocations of unix utilities like
`ls`. [dotfiles] repos became popular not long after
[GitHub](https://github.com) appeared on the scene, they're a great way to move
your settings between machines and browsing other peoples' files is a fun way
of learning about software.

At first, everyone invented their own ways to manage their dotfiles. For
example, I had a simple Rakefile which linked files from the checked out repo
into my home directory. As you might expect though, in the last decade a lot
has changed, and there are now loads of ways to manage your dotfiles. A few
projects are listed [here](https://dotfiles.github.io/), but the one I've
chosen to use ([chezmoi](https://github.com/twpayne/chezmoi/) isn't, so make
sure you look around if you're on the market.

Using a proper full-fledged open-source project beats custom scripts by miles,
there's more functionality and fewer bugs (probably!). chezmoi's cool features
include secret storage and templating, so you can automatically update files on
different systems. The files can still live in git, so you can easily keep them
on github, or in [keybase](https://keybase.io).

I won't go into any more detail here but if you work on multiple systems and
aren't using a system like chezmoi already then do. It's worth the effort to
set up!

## Network functions: extracting URLs

I frequently have to run various networking utilities against IP addresses and
DNS names, and modern browsers make it a faff to copy only the bit you need to
perform your lookup on. For example, if I copy the contents of my browser's
address bar right now, I get:

    https://github.com/mattfoster/dotfiles/blob/master/dot_zsh/network.zsh

and if I decide I want to get the IP address from that, I can't just use the
URL as an argument to `dig`:

    $ dig https://github.com/mattfoster/dotfiles/blob/master/dot_zsh/network.zsh

    ; <<>> DiG 9.10.6 <<>> https://github.com/mattfoster/dotfiles/blob/master/dot_zsh/network.zsh
    ;; global options: +cmd
    ;; Got answer:
    ;; ->>HEADER<<- opcode: QUERY, status: NXDOMAIN, id: 24396
    ;; flags: qr aa rd ra; QUERY: 1, ANSWER: 0, AUTHORITY: 0, ADDITIONAL: 0

    ;; QUESTION SECTION:
    ;https://github.com/mattfoster/dotfiles/blob/master/dot_zsh/network.zsh.	IN A

    ;; Query time: 28 msec
    ;; SERVER: 10.0.1.1#53(10.0.1.1)
    ;; WHEN: Sun Dec 29 17:38:41 GMT 2019
    ;; MSG SIZE  rcvd: 88

The same will happen with just about any other utility you can think of
(`host`, `nslookup`, `ping`, `whois`).

So, to save a little time, I have a collection of shell functions which extract
DNS names from URLs and pass them through to the utility I want to run.

    % dig https://github.com/mattfoster/dotfiles/blob/master/dot_zsh/network.zsh

    ; <<>> DiG 9.10.6 <<>> github.com
    ;; global options: +cmd
    ;; Got answer:
    ;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 58832
    ;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 0

    ;; QUESTION SECTION:
    ;github.com.			IN	A

    ;; ANSWER SECTION:
    github.com.		59	IN	A	140.82.118.3

    ;; Query time: 36 msec
    ;; SERVER: 10.0.1.1#53(10.0.1.1)
    ;; WHEN: Sun Dec 29 17:40:55 GMT 2019
    ;; MSG SIZE  rcvd: 44

This isn't particularly complex, but it saves a lot of time if you do this often.
The file at [network.zsh](https://github.com/mattfoster/dotfiles/blob/master/dot_zsh/network.zsh) wraps:

 • dig
 • nslookup
 • host
 • whois
 • ping

and I update it relatively frequently. The file should work in bash as well as
zsh.

## Network functions: other bits

In addition to the utilities above, I have a fews of other handy functions:

 * `headers` runs `curl -I -X GET` on a URL, this makes a `GET` request but then
only displays the headers, not the body. This is better than making a `HEAD`
request with just `curl -I`, as in my experience they often return different content.
 * `ipwhois` resolves a supplied DNS name or URL to an IP address (chopping out a
protocol and any path parts if needed) and runs `whois` on the result. If
the result is already an IP address it uses that. This currently only supports
IPv4, but I'll update it soon.
 * `pcurl` sets proxy environment variables and runs `curl`. This is a fast way
to get a URL into an intercepting proxy like [Burp Suite](https://portswigger.net/burp).
 * `ipsort` sorts lists of IPv4 addresses.

As I said above, you can find this at
[network.zsh](https://github.com/mattfoster/dotfiles/blob/master/dot_zsh/network.zsh).
I also plan to add some more IPv6 support in the near future.
