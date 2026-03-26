---
author: mpf
date: 2026-03-26T00:00:00+00:00
title: Exploring Amazon Data Exports
tags: ["data", "amazon", "privacy", "ai"]
type: post
---

Unsurprisingly, Amazon is pretty invasive when it comes to tracking Kindle use.
I'm not sure why they need to know how many milliseconds I read for, along with
exactly when I started and stopped, and how many page turns I've made per-session
for the last 9 years, but I expect they're trying to use this information to
more effectively advertise *at* me... or selling this to someone else who is
(OK, maybe this last point is unfair, as they say they "are not in the business of
selling our customers' personal information to others" in the [privacy
policy](https://www.amazon.co.uk/gp/help/customer/display.html?nodeId=GX7NJQ4ZB8MHFRNJ#GUID-A440AA65-7F7E-4134-8FA8-842156F43EEE__SECTION_597B86D9F6794FA59E718D4A9CC8F727).

Anyway, I requested my Kindle data using the [Amazon
tool](https://www.amazon.com/hz/privacy-central/data-requests/preview.html) and
had a poke around to see what interesting insights I could extract, then
because I found this quite interesting I decided to write about it. I used
[Amp][https://ampcode.com] to do most of the exploration here, so if you're
easily offended by AI tools then consider yourself warned.

## Exports

Data Exports from Amazon take a few days, and are delivered as a zip and a
manifest called `FileDescription` telling you what each file is. Here's the top
few lines of the 52 lines of kindle manifest:

```
File name,Description
Achievements.csv,"This file contains information about the challenges the customer has participated in (for example, 2023 Kindle Spring Challenge) and the achievement earned (for instance, Bookworm, BronzeReader)."
AppEngagement.csv,"This file contains information on what applications customers used on their devices and for how long. "
BookRelation.csv,This file contains the book within a series that a customer purchased as well as the date that they purchased it.
DeviceEngagement.csv,"This file contains information on how and when customers have used their devices. "
Devices.DeviceSetupConnections.csv,"This file contains device setup information, such as start/end time, device name, model, hardware and firmware version. This information is recorded at the time of device setup and used for frustration free setup when needed."
Devices.DMS.PII.csv,"This file contains a timestamp and Product Instance Identifiers (PII) such as the attribute set containing the serial number of the device listed under device type (e.g. Reality Switch, Ring alarm motion detector)"
DeviceSetupMetrics.csv,"This file contains information on the customer’s experience setting up a new device. "
DeviceUsageDataSetting.csv,This file contains information on the customer’s Device Usage Data privacy setting for each of their devices.
Digital.Content.Ownership.json,"This file contains the data related to the digital content rights for all the digital content borrowed and/or returned by the customer. There are many files because a Right is created each time the customer borrows and returns a book (for example, a Grant right is created when the book is borrowed and a Revoke right when the book is returned)."
```

I had a quick poke around by hand and then decided to get
[Amp](https://ampcode.com) to summarise the content of the directories, as this
was a quick exploration and AI agents really excel at tasks like this. Note
that the three rows on the bottom of the list are things I dropped here, not
part of the export.

{{<figure src="summary.png" caption="Amp's summary of the kindle content. Threat at: https://ampcode.com/threads/T-019d1458-1121-7329-b4a3-1254c034d171" >}}

By asking more pointed questions you can easily get Amp (or any coding agent)
to start thinking in code, and pull out more interesting stats. You can also
check the [thread
history](https://ampcode.com/threads/T-019d02d6-d405-71be-8a3f-50fed6ab9f7b) if
you want the code, which is cool if you decide to build something reusable.

```
=== READING INSIGHTS SUMMARY ===

Total reading time: 1095.4 hours (45.6 days)
Total reading sessions: 13,064
Days with reading tracked: 1,586
Date range: 2021-08-29 to 2026-03-16
Unique books read: 205
Books completed: 150

--- Reading hours by year ---
  2018: 48.5 hours across 308 sessions
  2019: 109.6 hours across 1,173 sessions
  2020: 168.1 hours across 840 sessions
  2021: 165.3 hours across 1,011 sessions
  2022: 130.5 hours across 1,244 sessions
  2023: 127.2 hours across 2,083 sessions
  2024: 103.5 hours across 2,326 sessions
  2025: 207.3 hours across 3,294 sessions
  2026: 35.5 hours across 785 sessions

--- Top 15 books by reading time ---
  1. The Business-Minded CISO: Run Your Security Program Efficien 62.9h (166 sessions)
  2. Gnomon                                                       27.2h (410 sessions)
  3. Semiosis: A novel of first contact                           25.3h (87 sessions)
  4. Network Effect: A Murderbot Novel (The Murderbot Diaries Boo 21.0h (34 sessions)
  6. Exodus: The Archimedes Engine                                16.0h (294 sessions)
  7. Fall or, Dodge in Hell: From the New York Times bestselling  15.2h (175 sessions)
  8. A Book of Bones: Private Investigator Charlie Parker hunts e 11.8h (65 sessions)
  9. The Rise and Fall of D.O.D.O.: A Thrilling Fantasy Novel of  11.8h (49 sessions)
  10. The Ministry for the Future                                  11.0h (99 sessions)
  11. Eyes of the Void: The thrilling sequel in this award-winning 10.8h (109 sessions)
  12. Inhibitor Phase                                              10.5h (47 sessions)
  13. Aurora Rising: Previously published as The Prefect (Inspecto 10.3h (48 sessions)
  14. Children of Ruin: New intelligences arise in this epic and t 10.2h (151 sessions)
  15. Tiamat's Wrath: Book 8 of the Expanse (now a Prime Original  10.1h (65 sessions)

--- 10 most recent completions ---
  2025-11-01  Forty Signs of Rain: A Highly Topical Eco-Fiction Thriller of Survival
  2025-11-10  Halcyon Years: A gripping new murder mystery set on a spaceship from t
  2025-11-21  Fifty Degrees Below: A Gripping Political Thriller Set Against a Globa
  2025-12-02  Sixty Days and Counting: A Topical Science Thriller of Politics and Cl
  2026-02-09  Exodus: The Archimedes Engine
  2026-02-14  The Shattering Peace: The acclaimed Old Man's War series returns in th
  2026-02-26  Dead Astronauts: A Compelling Cyberpunk Fantasy About the Fight for th
  2026-03-04  The Man Who Saw Seconds
  2026-03-11  Three Men in a Boat
  2026-03-15  A Guardian and a Thief: Longlisted for the Women's Prize for Fiction 2

Average session length: 5.0 minutes

--- Top 10 busiest months ---
  2025-06: 45.3 hours
  2025-07: 42.9 hours
  2020-01: 29.7 hours
  2020-07: 24.4 hours
  2021-10: 20.4 hours
  2025-11: 18.4 hours
  2025-08: 17.6 hours
  2021-08: 17.1 hours
  2022-04: 16.6 hours
  2020-02: 16.5 hours

Longest daily reading streak: 148 days
Current/most recent streak: 75 days
```

Looking more at `The Business-Minded CISO 62.9h (166 sessions)`, I found
that this outlier was caused by the Kindle Mac App recording a super-long
session, and not just me being obsessed with this book (although it *is* good).


## Visualisations

After my initial poke around, I decided to try and generate some graphs and
charts and images, and I settled on a graph showing reading sessions by time,
with midnight across the bottom because it looks better. Then later, after I
exported my Audible data, I added that to the top because Audible don't track
session times, just dates and durations (plus other bits like when you finish a
book).

You can see that embedded here. I'd love to be able to see a graph like this
all the time, and I think it's a shame the only way you can pull this sort data
easily seems to be by doing a data export.

It's fun that you can see my bed time get earlier and earlier (I blame having a
more busy and stressful job, then a child, and then an old dog who wakes up
super early! and there are clearly some weirdly long sessions which are
obviously wrong, but it's still cool.

{{< figure src="reading_activity_landscape.png" caption="Reading and listening activity. Listening activity has no associated times, so it's just stacked at the top">}}

Next I had Amp make a GitHub style contribution graph, and then added Audible
data too. I stopped subscribing to Audible in Feb 2026, but the data is still interesting:

{{< viz src="/viz/exploring-amazon-data-exports/reading_heatmap.html" height="600" >}}

I also made a long reading timeline page, but that's not all that interesting,
and that's where I stopped, I could probably have pull out more stats, but I
decided to leave it there.

Oh, one thing I did do was populate my [Doing](/doing/) page with Kindle and
Audible data going back as far as I could, which is pretty cool, but is mainly
a huge list of SFF! Overall, I think using LLMs as a way to poke around things
you probably wouldn't have had time to poke at otherwise is a decent use of
this new tech, and I really like Amp as a tool for this.
