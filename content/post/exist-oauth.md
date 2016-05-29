---
author: mpf
date: 2016-05-29T12:40:19+01:00
keywords:
- day one
- mac
- exist
title: Writing an Exist importer for Day One - Part 1 authentication
type: post
---

After writing a simple [Slogger plugin for MyFitnessPal](https://hackerific.net/2016/05/22/writing-a-slogger-plugin-to-import-myfitnesspal-data/)
I was keen to add more plugins for services I use, and so an obvious target was
[exist.io](https://exist.io). A lifelogger and activity correlator I've written
about [before](https://hackerific.net/2016/02/29/tracking-things-with-exist/).

Exist has an API, along with some very shiny and user friendly [API
docs](http://developer.exist.io/), so I set about learning how to grab the data
I need.  From the start, I knew this would be a bit more involved than just
munging some publicly accessible HTML from MFP, so decided to handle the tasks
in two main chunks. Authenticating and grabbing data, and Formatting the data
for Day One. This post is about authenticating and grabbing the data. Expect
part 2 next week.

## The Exist API

As I said above, Exist's API docs look sweet, with a handy nav bar on the left,
text in the middle and shell and python examples on the right, so top marks for
awesomeness there. I'll be using Ruby, so the examples aren't 100% applicable, but
they're close enough to be useful.

![exist API docs](/images/exist-docs.png)

Using the API to read information is pretty simple, and requests like:

        https://exist.io/api/1/users/$self/attributes/

Spit out attributes as JSON. As far as I can see, it's possible to query pretty
much everything Exist does using the API too, which is great. If you're logged
into Exist, and make the request above you should see a massive string of JSON
data.

[Authentication](http://developer.exist.io/#authentication-overview) is done
using either a simple token based system, or the more modern oAuth2. Naturally,
I decided to go with the more complex scheme, and use oAuth2, which I
think will end up being more scalable and simpler to setup for people who end
up using the plugin.

So, my first step was to register an application at: 
[https://exist.io/account/apps/](https://exist.io/account/apps/). Initially, I
used a local callback URL, like `http://localhost:3333/callback`, but found two
problems with that which led to me using a simple page on my main domain. The
first was that the localhost idea just didn't work, and the second was that the
callback must use HTTPS, which sounded like a lot of faff to do locally. Instead,
I used:

    https://hackerific.net/slogger/exist/

But more on that later!

## A prototype

After poring over some [other Slogger
plugins](https://github.com/ttscoff/Slogger/blob/master/lib/instagram_server.rb),
I decided I'd start by writing a proof of concept script, as I did in my last
post, and then port that to the plugin architecture later. I began by
getting the registered details of my App, and pasting them into a ruby script:

```
redirect_uri  = "https://hackerific.net/slogger/exist/"
client_id     = 'd26998cab3eaa34d5aca'
client_secret = 'e854ed9aa67b1b4680734035dba6aa475b621a4e'
scope         = 'read'
```

Now, the first step in the authentication process is to send your user to the
page `/oauth2/authorize`, which a bevy of URL parameters from the variables
above, so I did this:

```
auth_url      = "https://exist.io/oauth2/authorize?response_type=code&client_id=#{client_id}&redirect_uri=#{redirect_uri}&scope=#{scope}"
%x{open "#{auth_url}"}
```

This command causes the user's web browser to open, and ask the user to authorise the app:
I used `%x`, because I originally captured the output of the `open` command,
but quickly realised it wasn't useful, so using `system` would have been
cleaner. 

Incidentally, I really dislike using backticks in any kind of scripting
language as I think they look too much like single quotes. Because of that, I
always look for alternatives. In shell scripts, I tend to use `$(thing_to_run)`,
in perl, I use the `readpipe` function, and in ruby I use `%x{}`.

![Authorise this app?](/images/slogger-auth.png)

When a user clicks Authorise on exist's domain, it cause their browser to
redirect to the URL specified in the app's configuration, with a special code.
This code must be then converted into a special token, which is then used in
subsequent requests.

With my redirect URI, the user will end up being taken somewhere like this:

```
https://hackerific.net/slogger/exist/?state=&code=1206ef23bedced93a5c89ca06b8c1f3ee9e562b6
```

Now, as Slogger is a CLI application, I need the user to paste the code into my
script in order to save it for future use, so I decided to find a way to make
the page a little more user-friendly, by using JavaScript. I ended up with this:

![Code page](/images/code.png)

This works by reading the contents of `document.location.search` and writing
it into a `div`. To help defend against cross-site scripting, I encode
characters which might render as HTML tags:

```
var code = document.location.search
  .replace(/.*code=/, '')
  .replace(/&/g,'&amp;')
  .replace(/</g,'&lt;')
  .replace(/>/g,'&gt;');

code = code ? code : 'No code in URL.';
document.getElementById('code').innerHTML = code;
```

*Note*: It's possible to automatically put things in user's clipboards using JS, in 
[most browsers](https://developer.mozilla.org/en-US/docs/Web/Events/copy), but
I decided against doing that for now, to keep things as simple as possible.

Now, back to the ruby prototype. We've got the code the user needs to enter, so
the simple way of getting that is to use the function `gets`, and ask the user
to paste it in. Running strip on that will clean any leading or trailing
whitespace too.

So, `code = gets.strip` does what we want here. Then we can check it's a valid
code using a regular expression like `/0-9a-f/` to ensure it looks like a valid
hexadecimal string.

We actually ask the user for their code, open the browser and then use `gets`
to grab the code.

Once we have the code, the last thing we need to do to complete authentication
is make an HTTP POST request to swap the code for a Bearer token. To do that I
decided to use the [`rest-client`](https://github.com/rest-client/rest-client)
gem, like this:

```
response = RestClient.post(
  token_url,
  {
    'grant_type'    => 'authorization_code',
    'code'          => code,
    'client_id'     => client_id,
    'client_secret' => client_secret,
    'redirect_uri'  => redirect_uri,
  }
)
``` 

It would have been fairly simple to use `Net::HTTP` instead, but since we'll be
making other requests down the line I decided to use this library to simplify
things.

Now, assuming this code is valid, we'll get a JSON response containing several
elements, including our access token and its TTL (in seconds). Using the `JSON`
library, we can extract those things from the response using:

```
data = JSON.parse(response.to_str)
access_token = data['access_token']
expires      = Time.now + data['expires_in']
```

when I convert this into a plugin I'll make sure any exceptions are caught,
instead of just letting everything crash messily.

## Does that work?

So, now we've authenticated with Exist, it makes sense to check everything
actually worked. Using the token is a matter of including it in a HTTP request
header along with each API request. In Ruby, that looks like this:

```
  today = RestClient::Request.execute(
    method: :get,
    url: 'https://exist.io/api/1/users/$self/today/',
    headers: {'Authorization' => "Bearer #{access_token}" }
  )
```

And assuming that works, the response will contain masses of JSON data.
Well, in my tests I found that it does! I won't paste it here, because there's
just too much data.

## The final prototype

Here's my final prototype script. It's not exactly pretty, but it does the job
and it should be nice and easy to chop up and make into a plugin. 

Hopefully this post has demonstrated that you can use web based technologies
like oAuth2 to get things done in CLI apps.

In my next post I'll turn this into a plugin for Slogger, and work out how to
format all the JSON data the API supplies.

```
#! /usr/bin/env ruby

require 'json'
require 'rest_client'

redirect_uri  = "https://hackerific.net/slogger/exist/"
client_id     = 'd26998cab3eaa34d5aca'
client_secret = 'e854ed9aa67b1b4680734035dba6aa475b621a4e'
scope         = 'read'

auth_url      = "https://exist.io/oauth2/authorize?response_type=code&client_id=#{client_id}&redirect_uri=#{redirect_uri}&scope=#{scope}"
token_url     = "https://exist.io/oauth2/access_token"

# Start by asking the user to authorise the client. 
print "Please copy the code from your web browser, and then paste it below:\n>>";
%x{open "#{auth_url}"}

# Now get the code from the user.
code = gets.strip

# Check it looks reasonable
if code and code =~ /[0-9a-f]+/
  puts "\nThanks!"
else
  puts "\nInvalid code"
  exit
end

# And exchange it for a token
response = RestClient.post(
  token_url, 
  { 
    'grant_type'    => 'authorization_code',
    'code'          => code,
    'client_id'     => client_id,
    'client_secret' => client_secret,
    'redirect_uri'  => redirect_uri,
  }
)

data = JSON.parse(response.to_str)
access_token = data['access_token']
expires      = Time.now + data['expires_in']

begin
  today = RestClient::Request.execute(
    method: :get,
    url: 'https://exist.io/api/1/users/$self/today/',
    headers: {'Authorization' => "Bearer #{access_token}" }
  )

  puts today
rescue => e
  puts e.response
end

data = JSON.parse(today.to_str)
puts data
```
