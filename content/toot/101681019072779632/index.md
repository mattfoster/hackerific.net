---
date: 2019-03-02 12:20:21.957 +0000 UTC
post_uri: https://mastodon.radio/users/m0puh/statuses/101681019072779632
post_id: 101681019072779632
descendants:
- 101681035841451334
---
Just my shiny new µArt ( [https://www.crowdsupply.com/pylo/muart](https://www.crowdsupply.com/pylo/muart)) to flash some custom firmware on a couple of cheap Sonoff wifi switches ( [https://www.banggood.com/DIY-Wi-Fi-Wireless-Switch-For-Smart-Home-With-ABS-Shell-p-1019971.html](https://www.banggood.com/DIY-Wi-Fi-Wireless-Switch-For-Smart-Home-With-ABS-Shell-p-1019971.html)). They now work with Alexa without some dodgy third party cloud service.

It's funny that the USB UART I used cost considerably more than the devices!


![A small circuit board taped to a bench. On the left are two crocodile clips attached to two small wires which go under the board. These provide external power. Coming out of the centre of the board is a ribbon cable. This goes to the UART. The board is rectangular with a relay on the bottom right corner and small screw terminals at each end.](30194.jpeg)

Of course these switches don't have any sort of earth passthrough, so I guess I'll need to add something if I want to use them with almost anything useful.

Also, the firmware I used was Tasmota ( [https://github.com/arendst/Sonoff-Tasmota/](https://github.com/arendst/Sonoff-Tasmota/)) which supports other cool things like MQTT as well as Belkin emulation.

