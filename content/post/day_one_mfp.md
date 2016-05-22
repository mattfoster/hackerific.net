---
author: mpf
date: 2016-05-22T11:54:15+01:00
keywords:
- day one
- mac
- mfp
- slogger
title: Writing a Slogger plugin to import MyFitnessPal data
type: post
---

I've been using [MyFitnessPal](http://www.myfitnesspal.com) (MFP) to log exercise and
food for a couple of weeks (before that I tried
[SparkPeople](http://www.sparkpeople.com/index2-5.asp) but the app was buggy
and the food database wasn't great), and I really like knowing exactly how many
more calories I can eat, as well as keep track of exercise and weight.

![MFP log](/images/posts/mfplog.png)

Now, it's great to be able to log stuff using an app with a barcode scanner,
and then view stats and info online, but I don't like the idea of my data all
being locked away and belonging to someone else, and what it I want to use a
different service?  Basically, I want to feel like I own this data. 

My go to logging tool is [Brett Terpstra's](http://brettterpstra.com)
[Slogger](https://github.com/ttscoff/Slogger), which scrapes various online
services and then spits the results into [Day One](http://dayoneapp.com), but
there's no plugin for MFP. So, after a quick peek at some other plugins I
decided to write one.

## Data

If you can cope with the idea of your diary data being public, you can get a
simple HTML view of your daily food intake and exercise by visiting a URL like this:

        http://www.myfitnesspal.com/reports/printable_diary/mattpfoster877

This page has a fairly large amount of markup for what's basically two tables,
but the tables are just that, and they've got handy `id` attributes so should
be nice and easy to find using a scraping library.

My aim is to take the usable data from this page, convert it to Markdown, and
then save it to Day One, using Slogger. I'm going to do this by writing a
plugin.

As an aside, I'm happy with this sort of data being visible to anyone, because frankly, who
is going to care? If I wasn't, I'd have to work out how MFP's session
management worked, and probably use something like [Mechanize](http://mechanize.rubyforge.org/GUIDE_rdoc.html),
to login using a POST request, ensuring that whatever anti-CSRF mechanism MFP
uses is obeyed, and then save a session cookie or two for subsequent requests.
This is all very doable, but extra effort!

## Scraping and Munging

For this project, I'm using [Ruby](https://www.ruby-lang.org/en/), because
that's what Slogger is written in. I still love Ruby, but have more experience
writing perl these days, so forgive me if my Ruby code looks a bit perly!

I decided to use the [Nokogiri](http://www.nokogiri.org) library to parse the
HTML and extract the data I want.

The two tables look like this:

        <table class="table0" id="food">

and

        <table class="table0" id="excercise">

So, it's pretty easy to extract what we want using CSS selectors (note the
misspelling of 'excercise'!), and code like this will do it:

```ruby
  doc = Nokogiri::HTML(open(url))
  food = doc.css('table#food').to_s
  exercise = doc.css('table#excercise').to_s
```

This will save the tables, as HTML, into the `food` and `exercise` variables. 

Next, I need to turn these tables into Markdown. Now, I could probably find a
`gem` to do this for me, or implement something myself, but I decided that
since I'm using one of Brett's tools I may as well also use another, and went
with the online converter [Marky](http://fuckyeahmarkdown.com). 

Basically, you pass its API an urlencoded string and it spits back markdown for
you. So you can do this with a method like this:

```ruby
  def to_md(str)
    str = URI.escape(str)
    to_md_url = 'http://fuckyeahmarkdown.com/go/'
    conv = open(to_md_url + '?html=' + str)
    conv.read
  end
```

The `open` function is part of 
[open-uri](http://ruby-doc.org/stdlib-2.2.0/libdoc/open-uri/rdoc/OpenURI.html),
which is in the standard library. It would be good practice to check the
response code here, but I'm being lazy! Also, the docs for the library are
really sparse, so if you're doing any Ruby programming do yourself a huge
favour and buy 
[Programming Ruby](https://pragprog.com/book/ruby4/programming-ruby-1-9-2-0).

Now, chaining these two together with a bit of other glue code gives me the
following:

```ruby
#! /usr/bin/env ruby

require 'open-uri'
require 'nokogiri'


def build_report_url(
    username,
    baseurl = 'http://www.myfitnesspal.com/reports/printable_diary/',
    date = Time.now.strftime("%Y-%m-%d")
  )
  baseurl + username + '?from=' + date + '&to=' + date
end

def grab(url)
  doc = Nokogiri::HTML(open(url))

  if doc.to_s.include?('This Username is Invalid')
    abort "No data, check username is correct and diary is public"
  end

  log = {}
  log[:food] = doc.css('table#food').to_s
  # Note: the div name is spelt wrong!
  log[:exercise] = doc.css('table#excercise').to_s

  log
end

def to_md(str)
  str = URI.escape(str)
  to_md_url = 'http://fuckyeahmarkdown.com/go/'
  conv = open(to_md_url + '?html=' + str)
  conv.read
end

username = 'mattpfoster877'
url = build_report_url(username)

logs = grab(url)

puts '# MyFitnessPal daily report'
puts
puts "User: [#{username}](http://www.myfitnesspal.com/food/diary/#{username})"

logs.each do |name, table|
  puts
  puts '## ' + name.to_s.capitalize
  puts to_md(table)
end
```

Which prints something like this when run: 

```
## MyFitnessPal daily report

User: [mattpfoster877](http://www.myfitnesspal.com/food/diary/mattpfoster877)

### Food

| Foods                                                                 | Calories | Carbs | Fat | Protein | Cholest | Sodium  | Sugars | Fiber |
| --------------------------------------------------------------------- | -------- | ----- | --- | ------- | ------- | ------- | ------ | ----- |
| Breakfast                                                             |          |       |     |         |         |         |        |       |
| Hovis - Hovis Wholemeal Seed Sensation Seven Seeds Toast, 2 slice 44g | 218      | 28g   | 5g  | 10g     | 0mg     | 322mg   | 3g     | 11g   |
| Butter With Salt - Butter, 15 g                                       | 63       | 0g    | 17g | 0g      | 45mg    | 135mg   | 0g     | 0g    |
| Eggs - Scrambled (whole egg), 1.5 large                               | 152      | 2g    | 11g | 10g     | 322mg   | 256mg   | 2g     | 0g    |
| Lunch                                                                 |          |       |     |         |         |         |        |       |
| mission - deli wrap multigrain, 1 wrap                                | 183      | 31g   | 4g  | 5g      | 0mg     | 0mg     | 0g     | 2g    |
| Aconbury - Organic Mixed Bean Sprouts, 50 g                           | 70       | 11g   | 1g  | 4g      | 0mg     | 40mg    | 0g     | 1g    |
| Carrots, baby, raw, 1 large                                           | 5        | 1g    | 0g  | 0g      | 0mg     | 12mg    | 1g     | 0g    |
| Quorn - Meat Free Chicken Style Pieces, 75 g                          | 72       | 1g    | 2g  | 10g     | 0mg     | 180mg   | 1g     | 5g    |
| Dinner                                                                |          |       |     |         |         |         |        |       |
| Chicken Breast - Roasted - Chicken Breast, 200 g                      | 394      | 0g    | 16g | 60g     | 168mg   | 142mg   | 0g     | 0g    |
| Potato - Mashed Homemade, 270 g                                       | 260      | 52g   | 8g  | 10g     | 10mg    | 200mg   | 2g     | 4g    |
| Snacks                                                                |          |       |     |         |         |         |        |       |
| Tesco Everyday Value - Lightly Salted Tortillas Jaffa, 40 g           | 189      | 26g   | 8g  | 3g      | 0mg     | 320mg   | 1g     | 2g    |
| Naked - Cocoa Crunch Bar, 30 g                                        | 106      | 14g   | 3g  | 6g      | 0mg     | 0mg     | 13g    | 2g    |
| Ryvita - Thins Sweet Chilli Flatbreads, 1 thin, 8g                    | 32       | 6g    | 1g  | 1g      | 0mg     | 1mg     | 1g     | 0g    |
| TOTAL:                                                                | 1,744    | 172g  | 76g | 119g    | 545mg   | 1,608mg | 24g    | 27g   |

### Exercise

| Exercises                  | Calories | Minutes | Sets | Reps | Weight |
| -------------------------- | -------- | ------- | ---- | ---- | ------ |
| Cardiovascular             |          |         |      |      |        |
| MFP iOS calorie adjustment | 150      | 1       |      |
| Strength Training          |          |         |      |
| Beast maker                |          | 5       | 5    |      |
| TOTALS:                    | 150      | 1       | 5    | 5    | 0      |

```

# A Plugin

This is exactly what I'm looking for, so now I just need to plug my proof of
concept into a Slogger plugin. To do that, I copied the 
[plugin template](https://github.com/ttscoff/Slogger/blob/master/plugin_template.rb), 
and populated the comments and config sections. Then I added all my helper
functions and instead of printing the markdown to stdout I pushed it all into a
string which I then used to create a diary entry. The guts of the plugin
essentially boil down to this:

```
    url = build_report_url(username, today.strftime('%Y-%m-%d'))
    logs = grab(url)

    entry  = "## MyFitnessPal daily report\n\n"
    entry +="User: [#{username}](http://www.myfitnesspal.com/food/diary/#{username})\n"

    logs.each do |name, table|
      entry += "\n### " + name.to_s.capitalize
      entry += to_md(table)
    end
    entry += "\n\n#{tags}"

    DayOne.new.to_dayone({ 'content' => entry })
```

Which is pretty compact, and works well too! It's almost exactly as above, but
the `today` variable is set by slogger.

For now, this plugin is only available in my [fork of
Slogger](https://github.com/mattfoster/Slogger). If you want to use it, grab
[mfplogger.rb](https://github.com/mattfoster/Slogger/blob/master/plugins/mfplogger.rb),
put it in your slogger plugins directory, and run `./slogger` to have it
generate the config stubs you need. Then edit the `slogger_config` to set your
username.

My config looks like this:

```
MFPLogger:
  description:
  - MyFitnessPal Logger
  - Your diary must be public. Set at http://www.myfitnesspal.com/account/diary_settings
  MFPLogger_last_run: Sat May 21 23:50:13 2016
  service_username: mattpfoster877
  tags: "#social #fitness"
```

I plan to write a couple more plugins, but once I've done that I'll submit a
github pull request and hopefully get this merged into the main repo!
