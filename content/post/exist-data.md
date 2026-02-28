---
author: mpf
date: 2016-06-05T17:30:52+01:00
keywords:
- day one
- mac
- exist
title: Writing an Exist importer for Day One - Part 2 logging
topics:
- topic 1
type: post
---

In my [last post](https://hackerific.net/2016/05/29/writing-an-exist-importer-for-day-one---part-1-authentication/)
I worked out how to grab data from [Exist](https://exist.io), using oAuth 2. In
this post, I'll take the data from the Exist API, convert it into markdown, ready for
integrating into a Slogger plugin. Unfortunately, due to me running out of time
contracting the plugin will have to wait until part three!

## Recap

At the end of the last post, I had a way to authenticate with Exist and get back
a token which could be used to make requests for data. The data I want comes
back as a big blob of JSON.

Since I know my prototype authenticator and token grabber works, it's now time to
work on getting the data into a format I can easily use, and print the bits I'm
interested in as markdown.

## Grabbing data

To start with, I downloaded and saved a copy of the JSON data so I won't need
to pound the API while playing.

Basically, in place of the HTTP request with the `Bearer` token, I can just use
`File.open(filename, 'r').read` when
testing.

## Templating

Next, to keep dependencies to a minimum, I decided to use
[ERB](http://ruby-doc.org/stdlib-2.3.0/libdoc/erb/rdoc/ERB.html), which is part
of the standard library.

Template libraries are on of my all time favourite things in software. They're
so awesomely useful! My favourite is probably [Template
Toolkit](http://template-toolkit.org/), but ERB is extremely powerful, and will
suit us fine for this project. To help keep everything small, I'm going to store the
template in the same file as the source, and use the `DATA` object to read it.

In ruby `DATA` is an instance of the `File` class, with the `lineno` parameter
set to the line after the first occurrence of `__END__`. This is amazingly
awesome, and useful, despite being totally non-magic. If you don't believe me,
have a google, or play around!

So, I'm going to end up with my plugin scripts looking something like this:

```
# ruby code to grab data
# call to ERB
__END__
<%= template_variable %>
```

All in a single file.

While I was looking into the best way to proceed with this, I
discovered that `JSON.parse` can take a [default
class](http://ruby-doc.org/stdlib-2.0.0/libdoc/json/rdoc/JSON.html#method-i-parse)
for the objects it creates. To keep things nice and easy to access within the
template, I'm going to use
[OpenStruct](http://ruby-doc.org/stdlib-2.3.0/libdoc/ostruct/rdoc/OpenStruct.html),
and using that option I can parse the JSON data directly into one.

```
today = File.open(filename, 'r').read
data = JSON.parse(today, object_class: OpenStruct)
```

So, now that I have my data in a form I can easily use inside ERB, I need to
work out how to call ERB and provide the OpenStruct. I don't really like the
example given in the
[docs](http://ruby-doc.org/stdlib-2.3.0/libdoc/erb/rdoc/ERB.html#method-c-new-label-Example),
I think it's too clunky and complex for a small script, and I'd much rather
have a way to call it like this:

```
fill_template(template, data)
```

The cleanest way I found to do this was on [Stack
Overflow](http://stackoverflow.com/a/9734736/15368), and looks like this:

```
def fill_template(template, vars)
  ERB.new(template, nil, '-').result(vars.instance_eval { binding })
end
```

Which does exactly what I want. The `-` allows me to use template directives
with `-` signs in to prevent printing extra newlines. Something that's pretty
important in plain text templating.

Using this, I can now call `post = erb(DATA.read, data)` to interpolate a
template in the DATA section of my file. The next step is designing the
template.

To do that, I had a look at the structure of the JSON data, using `jq` a JSON
pretty printer.

![](/images/jq.png)

So, I have a big hash with some data about my account, followed by an array of
groups of attributes. I need to loop through each group of attributes and print
the item and its value into a table. For good measure I'll also add the data
source, like this:

```
## Exist data for <%= username %>

<% attributes.each do |attr| %>
### <%= attr.label %>

| Item | Value | Source |
|------|-------|--------|
<% attr.items.each do |item| -%>
| <%= item.label %> | <%= item.value %> | <%= item.service %> |
<% end -%>
<% end %>

Data grabbed at: <%= local_time %>
```

This will print me a series of tables, separated by headings, like this:

```
## Exist data for mpf


### Activity

| Item | Value | Source |
|------|-------|--------|
| Steps |  | exist_for_ios |
| Active minutes |  | withings |
| Elevation |  | withings |
| Floors |  | exist_for_ios |
| Distance |  | exist_for_ios |
| Steps goal | 8367 | withings |

### Mood

| Item | Value | Source |
|------|-------|--------|
| Mood |  | exist_for_ios |
| Daily note |  | exist_for_ios |

### Sleep

| Item | Value | Source |
|------|-------|--------|
| Time asleep |  | withings |
| Time in bed |  | withings |
| Bedtime |  | withings |
| Wake time |  | withings |
| Awakenings |  | withings |
| Time asleep goal |  | withings |

### Health

| Item | Value | Source |
|------|-------|--------|
| Weight | 73.25 | withings |
| Heartrate |  | withings |

### Location

| Item | Value | Source |
|------|-------|--------|
| Check-ins | 0 | foursquare |
| Location | 51.3864056651,-2.36120223999 | foursquare |

### Media

| Item | Value | Source |
|------|-------|--------|
| Tracks played | 3 | lastfm |

### Twitter

| Item | Value | Source |
|------|-------|--------|
| Tweets | 0 | twitter |
| Twitter mentions | 0 | twitter |
| Twitter username | mattpfoster | twitter |

### Weather

| Item | Value | Source |
|------|-------|--------|
| Max temp | 23.3 | forecast |
| Min temp | 13.5 | forecast |
| Precipitation | 0.023 | forecast |
| Cloud cover | 0.47 | forecast |
| Wind speed | 2.38 | forecast |
| Weather summary | Partly cloudy throughout the day. | forecast |
| Weather icon | partly-cloudy-day | forecast |


Data grabbed at: 2016-06-05T09:29:02.591+01:00
```

Which renders nicely when compiled as markdown. So, the script so far looks like this:

```
require 'erb'
require 'ostruct'

def erb(template, vars)
  ERB.new(template, nil, '-').result(vars.instance_eval { binding })
end

def data_from_file(filename)
  File.open(filename, 'r').read
end

today = data_from_file('data.json')
data = JSON.parse(today, object_class: OpenStruct)

puts erb(DATA.read, data)

__END__
## Exist data for <%= username %>

<% attributes.each do |attr| %>
### <%= attr.label %>

| Item | Value | Source |
|------|-------|--------|
<% attr.items.each do |item| -%>
| <%= item.label %> | <%= item.value %> | <%= item.service %> |
<% end -%>
<% end %>

Data grabbed at: <%= local_time %>
```

Now, I know I'm drawing this out a bit, but in my next post, I'll put this all
together into a working Slogger plugin. I was planning to do that in this post,
but I haven't had time (yes, Bloodborne may be the reason)!
