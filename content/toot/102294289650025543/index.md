---
date: 2019-06-18 19:43:08.466 +0000 UTC
post_uri: https://mastodon.radio/users/m0puh/statuses/102294289650025543
post_id: 102294289650025543
---
Finally got my Pi synced to the PPS pin on the GPS I plugged into it. It's currently indoors with a small ceramic antenna, but works.

Software is gpsd and chrony, hardware is a cheap ublox board with a hirose u.fl connector and a patch antenna, soon to be replaced with a chinese outdoor antenna.

The Pi is a model b, configured to use the standard UART (ttyS0) not the better one (ttyACM0), but that might need to change.

I think it'll be cool to add a little display with position/clock info.


![Output of chronyc sources -v, showing various time sources. PPS0 is being used to set the system clock.](65626.png)

![GPS information from a small python script. Included is time, latitude, longitude, maidenhead grid square a few other bits.](65630.png)

