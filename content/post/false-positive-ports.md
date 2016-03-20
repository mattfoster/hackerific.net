---
author: author
date: 2016-03-20T12:38:13Z
tags:
- nmap
- network
title: False positive TCP ports!
topics:
- nmap
- security
type: post
---

Every now and then I run port scans of the VPS running this site to check
there's nothing untoward and that I can see everything I expect to see.
Recently, one thing that gave me pause was the fact that when I do this from
home there are _extra open ports_ in [nmap's](https://nmap.org) output.
After convincing myself that my server hadn't actually been owned, I decided to
look into it. This post shows how I used nmap to to that.

## Background

It's good security practice to run regular port scans against servers to help
make sure there's nothing unexpected or missing, and the go-tool tool for this
is the ubiquitous [nmap](https://nmap.org) scanner. One day I nmapped my VPS from my
home Virgin cable connection, and saw this:

```
% sudo nmap hackerific.net
Starting Nmap 7.01 ( https://nmap.org ) at 2016-03-20 12:44 GMT
Nmap scan report for hackerific.net (178.79.182.85)
Host is up (0.020s latency).
Other addresses for hackerific.net (not scanned): 2a01:7e00::f03c:91ff:fedf:951f
Not shown: 993 filtered ports
PORT     STATE SERVICE
21/tcp   open  ftp
22/tcp   open  ssh
25/tcp   open  smtp
80/tcp   open  http
443/tcp  open  https
554/tcp  open  rtsp
7070/tcp open  realserver

Nmap done: 1 IP address (1 host up) scanned in 8.17 seconds
```

I was immediately surprised by the `ftp, ``rtsp` and `realserver` ports because
I know I don't use them. My first response was to worry that my VPS had been
hacked, so I logged in and used `netstat` to check for listening services.
While some rootkits might hide services from netstat, this was a good enough
start:

```
% sudo netstat -tlpn | fgrep '0.0.0.0'
tcp        0      0 127.0.0.1:3306          0.0.0.0:*               LISTEN      3685/mysqld
tcp        0      0 0.0.0.0:587             0.0.0.0:*               LISTEN      3927/master
tcp        0      0 0.0.0.0:143             0.0.0.0:*               LISTEN      1/init
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      3141/sshd
tcp        0      0 0.0.0.0:25              0.0.0.0:*               LISTEN      3927/master
tcp        0      0 0.0.0.0:1883            0.0.0.0:*               LISTEN      17599/mosquitto
tcp        0      0 0.0.0.0:993             0.0.0.0:*               LISTEN      1/init
```

So I was pretty much convinced my server was fine. Naturally, I decided to dig a little deeper. 

# More scanning

My first step was to increase the information gathered by nmap. I was already
running as root, which let me use a SYN scan, instead of a less-flexible TCP
connect scan, but I wasn't doing any service identification. This meant that
the `rtsp`, `realserver` and `ftp` service identifications were based purely on
port numbers (from `/etc/services`), so I reran with `-sV`, to add service
version detection:

```
% sudo nmap hackerific.net -sV
Starting Nmap 7.01 ( https://nmap.org ) at 2016-03-20 12:52 GMT
Nmap scan report for hackerific.net (178.79.182.85)
Host is up (0.019s latency).
Other addresses for hackerific.net (not scanned): 2a01:7e00::f03c:91ff:fedf:951f
Not shown: 993 filtered ports
PORT     STATE SERVICE     VERSION
21/tcp   open  ftp?
22/tcp   open  ssh         OpenSSH 6.7p1 (protocol 2.0)
25/tcp   open  smtp        Postfix smtpd
80/tcp   open  http        Apache httpd
443/tcp  open  ssl/http    Apache httpd
554/tcp  open  rtsp?
7070/tcp open  realserver?
Service Info: Hosts:  hackerific.net, caninewildwalks.com

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 143.91 seconds
```

This was interesting because of the trailing question marks, which mean nmap
once again fell back on information from `/etc/services`, it also means that
those ports are probably not running `ftp`, `rtsp` and `realserver`, or they'd
probably have been identified.

The other services with actual version information showed exactly what I
expected, too (`SSH-2.0-OpenSSH_6.7p1` is what you see if you connect to port
22 of my VPS using netcat). So, my next step was to get some information on
_why_ nmap was displaying those results. To do this, I added the `--reason`
argument:

```
sudo nmap hackerific.net -sV --reason -p 21,22,554,7070

Starting Nmap 7.01 ( https://nmap.org ) at 2016-03-20 12:58 GMT
Nmap scan report for hackerific.net (178.79.182.85)
Host is up, received syn-ack ttl 53 (0.016s latency).
Other addresses for hackerific.net (not scanned): 2a01:7e00::f03c:91ff:fedf:951f
PORT     STATE SERVICE     REASON         VERSION
21/tcp   open  ftp?        syn-ack ttl 64
22/tcp   open  ssh         syn-ack ttl 53 OpenSSH 6.7p1 (protocol 2.0)
554/tcp  open  rtsp?       syn-ack ttl 64
7070/tcp open  realserver? syn-ack ttl 64

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 138.55 seconds
```

I also cut down the number of open ports, but left a genuine port in the list
for comparison. 

The `reason` argument adds an extra column to the results which can help you
determine why nmap decided the port was open. So, interpreting the results, we
can see that the legitimate port has a TTL of 53, and that the others have a
TTL of 64. All were reported as being open because they responded with SYN-ACK
(the second phase of the TPP three way handshake). 

The difference in TTL strongly suggests that the strange responses come from a
different host than my VPS. Adding `--packet-trace` gives a full debugging
output we can use to further compare the responses, so I did that, along with
cutting down the number of ports, and removing `-sV` to keep the amount of
output down:

```
sudo nmap hackerific.net --reason -p 21,22 --packet-trace

Starting Nmap 7.01 ( https://nmap.org ) at 2016-03-20 13:14 GMT
SENT (0.1215s) ICMP [10.0.1.40 > 178.79.182.85 Echo request (type=8/code=0) id=38331 seq=0] IP [ttl=55 id=55007 iplen=28 ]
SENT (0.1215s) TCP 10.0.1.40:36727 > 178.79.182.85:443 S ttl=46 id=58474 iplen=44  seq=2076185214 win=1024 <mss 1460>
SENT (0.1216s) TCP 10.0.1.40:36727 > 178.79.182.85:80 A ttl=39 id=255 iplen=40  seq=0 win=1024
SENT (0.1217s) ICMP [10.0.1.40 > 178.79.182.85 Timestamp request (type=13/code=0) id=30468 seq=0 orig=0 recv=0 trans=0] IP [ttl=46 id=39532 iplen=40 ]
RCVD (0.1407s) ICMP [178.79.182.85 > 10.0.1.40 Echo reply (type=0/code=0) id=38331 seq=0] IP [ttl=53 id=2133 iplen=28 ]
NSOCK INFO [0.1460s] nsock_iod_new2(): nsock_iod_new (IOD #1)
NSOCK INFO [0.1460s] nsock_connect_udp(): UDP connection requested to 10.0.1.1:53 (IOD #1) EID 8
NSOCK INFO [0.1470s] nsock_read(): Read request from IOD #1 [10.0.1.1:53] (timeout: -1ms) EID 18
NSOCK INFO [0.1470s] nsock_write(): Write request for 44 bytes to IOD #1 EID 27 [10.0.1.1:53]
NSOCK INFO [0.1470s] nsock_trace_handler_callback(): Callback: CONNECT SUCCESS for EID 8 [10.0.1.1:53]
NSOCK INFO [0.1470s] nsock_trace_handler_callback(): Callback: WRITE SUCCESS for EID 27 [10.0.1.1:53]
NSOCK INFO [0.1490s] nsock_trace_handler_callback(): Callback: READ SUCCESS for EID 18 [10.0.1.1:53] (72 bytes): 0............85.182.79.178.in-addr.arpa.............M]...hackerific.net.
NSOCK INFO [0.1490s] nsock_read(): Read request from IOD #1 [10.0.1.1:53] (timeout: -1ms) EID 34
NSOCK INFO [0.1490s] nsock_iod_delete(): nsock_iod_delete (IOD #1)
NSOCK INFO [0.1490s] nevent_delete(): nevent_delete on event #34 (type READ)
SENT (0.1511s) TCP 10.0.1.40:36983 > 178.79.182.85:21 S ttl=50 id=51553 iplen=44  seq=1740773168 win=1024 <mss 1460>
SENT (0.1512s) TCP 10.0.1.40:36983 > 178.79.182.85:22 S ttl=46 id=18522 iplen=44  seq=1740773168 win=1024 <mss 1460>
RCVD (0.1525s) TCP 178.79.182.85:21 > 10.0.1.40:36983 SA ttl=64 id=13475 iplen=44  seq=1830893946 win=32768 <mss 1460>
RCVD (0.1723s) TCP 178.79.182.85:22 > 10.0.1.40:36983 SA ttl=53 id=53263 iplen=44  seq=3028947473 win=29200 <mss 1460>
Nmap scan report for hackerific.net (178.79.182.85)
Host is up, received echo-reply ttl 53 (0.018s latency).
Other addresses for hackerific.net (not scanned): 2a01:7e00::f03c:91ff:fedf:951f
PORT   STATE SERVICE REASON
21/tcp open  ftp     syn-ack ttl 64
22/tcp open  ssh     syn-ack ttl 53

Nmap done: 1 IP address (1 host up) scanned in 0.18 seconds
```

When you enable packet trace, nmap shows you every packet it sends, and
everything it sees in response. Breaking down the output above, there's nmap's
host detection near the top:

```
SENT (0.1215s) ICMP [10.0.1.40 > 178.79.182.85 Echo request (type=8/code=0) id=38331 seq=0] IP [ttl=55 id=55007 iplen=28 ]
SENT (0.1215s) TCP 10.0.1.40:36727 > 178.79.182.85:443 S ttl=46 id=58474 iplen=44  seq=2076185214 win=1024 <mss 1460>
SENT (0.1216s) TCP 10.0.1.40:36727 > 178.79.182.85:80 A ttl=39 id=255 iplen=40  seq=0 win=1024
SENT (0.1217s) ICMP [10.0.1.40 > 178.79.182.85 Timestamp request (type=13/code=0) id=30468 seq=0 orig=0 recv=0 trans=0] IP [ttl=46 id=39532 iplen=40 ]
RCVD (0.1407s) ICMP [178.79.182.85 > 10.0.1.40 Echo reply (type=0/code=0) id=38331 seq=0] IP [ttl=53 id=2133 iplen=28 ]
```

In which it sends an ICMP Echo request, then a SYN to TCP port 443, and an
(optimistic) ACK to TCP port 80. Finally, it sends an ICMP timestamp request.
These are all marked with `SENT`.  Next, it sees a response to the initial ICMP
Echo response, and so determines that the host is up.  You can have nmap skip
this step by passing the `-Pn` argument, and then nmap will just assume hosts
are up.

The next interesting bit of output is:

```
SENT (0.1511s) TCP 10.0.1.40:36983 > 178.79.182.85:21 S ttl=50 id=51553 iplen=44  seq=1740773168 win=1024 <mss 1460>
SENT (0.1512s) TCP 10.0.1.40:36983 > 178.79.182.85:22 S ttl=46 id=18522 iplen=44  seq=1740773168 win=1024 <mss 1460>
RCVD (0.1525s) TCP 178.79.182.85:21 > 10.0.1.40:36983 SA ttl=64 id=13475 iplen=44  seq=1830893946 win=32768 <mss 1460>
RCVD (0.1723s) TCP 178.79.182.85:22 > 10.0.1.40:36983 SA ttl=53 id=53263 iplen=44  seq=3028947473 win=29200 <mss 1460>
```

Because this is the actual port scan. In this stage, nmap sends two SYN packets
to TCP ports 21 and 22, and then sees two very different responses. In particular,
as well as the TTL difference mentioned above, the window size is not the same,
adding further weight to the idea the these responses are coming from a
different machine.  In fact, the window sizes from all of the 'fake' ports are
32768, where as the legitimate responses are all 29200, making it look likely
that all of the weird responses come from the same place, too.

At this point, we've gathered most of the information we can get from nmap, but
we still haven't really worked out where these fake ports are being added, so
the last step is to run some
[traceroutes](https://en.wikipedia.org/wiki/Traceroute). First, here's a legit
port:

```
% sudo nmap hackerific.net --reason -p 22 --traceroute

Starting Nmap 7.01 ( https://nmap.org ) at 2016-03-20 13:27 GMT
Nmap scan report for hackerific.net (178.79.182.85)
Host is up, received echo-reply ttl 53 (0.021s latency).
Other addresses for hackerific.net (not scanned): 2a01:7e00::f03c:91ff:fedf:951f
PORT   STATE SERVICE REASON
22/tcp open  ssh     syn-ack ttl 53

TRACEROUTE (using port 22/tcp)
HOP RTT      ADDRESS
1   1.86 ms  10.0.1.1
2   15.73 ms cpc65601-trow6-2-0-gw.18-1.cable.virginm.net (82.38.128.1)
3   17.50 ms aztw-core-2b-xe-112-0.network.virginmedia.net (62.252.228.209)
4   ...
5   19.29 ms brhm-bb-1c-ae1-0.network.virginmedia.net (62.254.42.210)
6   26.41 ms tcl5-ic-2-ae0-0.network.virginmedia.net (212.250.15.210)
7   ...
8   27.70 ms 85.90.238.69
9   27.72 ms 85.90.238.69
10  ...
11  21.03 ms hackerific.net (178.79.182.85)

Nmap done: 1 IP address (1 host up) scanned in 3.19 seconds
```

So we can see my VPS is 11 hops away from home, with a latency of about 21 ms.

Next, here's one of the dodgy ports:

```
% sudo nmap hackerific.net --reason -p 21 --traceroute

Starting Nmap 7.01 ( https://nmap.org ) at 2016-03-20 13:28 GMT
Nmap scan report for hackerific.net (178.79.182.85)
Host is up, received echo-reply ttl 53 (0.011s latency).
Other addresses for hackerific.net (not scanned): 2a01:7e00::f03c:91ff:fedf:951f
PORT   STATE SERVICE REASON
21/tcp open  ftp     syn-ack ttl 64

TRACEROUTE (using port 21/tcp)
HOP RTT     ADDRESS
1   2.37 ms hackerific.net (178.79.182.85)

Nmap done: 1 IP address (1 host up) scanned in 0.20 seconds
```

Well that's interesting! The round trip time is really low, just 2.37 ms, instead of 21.03
ms above, and there's only one hop.This means that after all this investigating we can
conclude that the 'open' ports are actually on, or very close to my cable router!
Of course, I've no idea why this would be the case but perhaps these ports are
used to provide TV and phone services?

## Wrap Up

I hope you've found this quick journey though nmap results interesting, and
didn't find the ending a let down!  Hopefully this illustrates some of the ways
you can use nmap's output to help you do some network detective work.

I use nmap at quite a lot and I've found the [Nmap Network Scanning](http://a-fwd.com/asin=0979958717) 
guide indispensable, as well as being a decent read. I recommend giving it a
read if you want to know more about how nmap and other scanning tools work.
