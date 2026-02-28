---
author: mpf
date: 2016-06-12T19:05:15+01:00
title: Writing an Exist importer for Day One - Part 3 plugging in
keywords:
- day one
- mac
- exist
type: post
---

Well, it's taken an embarrassingly long time to finish writing about it, but
here's the final post on my [Exist](https://exist.io) plugin for
[Slogger](https://github.com/ttscoff/Slogger).

If you've not seen the other sections, you'll want to start by reading
[Part 1](https://hackerific.net/2016/05/29/writing-an-exist-importer-for-day-one---part-1-authentication/)
and
[Part
2](https://hackerific.net/2016/06/05/writing-an-exist-importer-for-day-one---part-2-logging/),
as this article just pulls the parts of the previous two together and into a Slogger plugin.


Writing plugins is pretty straightforward, and there's a
[template](https://github.com/ttscoff/Slogger/blob/master/plugin_template.rb)
to help too. I started turning all my hackery from the previous two parts in
this series into a plugin by copying that into the plugins directory, and
picking a name for it. I close `existlogger` for the filename, and
`ExistLogger` for the class name.

I then populated the `config` block in the class with the constants needed to
authenticate with Exist.

```
config = {
  'description' => [
    'Exist.io Logger',
    'https://exist.io'
  ],
  'redirect_uri'  => "https://hackerific.net/slogger/exist/",
  'client_id'     => 'd26998cab3eaa34d5aca',
  'client_secret' => 'e854ed9aa67b1b4680734035dba6aa475b621a4e',
  'tags'          => '#personal #fitness'
}
```

Next, I split my previous proof of concept script into a few more subs and
pasted them into the plugin class, and then set about trying to work out how to
plumb in the oAuth code.

I found that when Slogger first runs, it creates a config section containing
the data specified in the config hash at the top of the plugin, so if you want
to tell whether a user has actually set a specific variable, the easiest thing
to do with wait until after the first run. Then once that run has complete
you'll have access to the config hash on the next run, and will be able to tell
if there's an oAuth access token set, so that's what I did. It took a while for
me to work out how to do it, but it seems to work.

I moved the template out of the DATA section of the script and into a heredoc, like this:

```
template = <<END
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
END
```

Because it's not possible to unambiguously use the DATA constant in
multi-script projects. This is a little disappointing, but no big deal. I
considered reading the current file and finding the `__END__` marker, but
didn't think the added complexity was worth it.

Finally, I tested the plugin a few times to check it works OK, and surprise! it
seems too, so that's cool.

![](/images/exist-log.png)

Here's the current code:

```
=begin
Plugin: Exist Logger
Description: Logs your Exist data
Author: [Matt Foster](https://hackerific.net)
Configuration:
  redirect_uri: 'oAuth2 redirect URI'
  client_id: 'oAuth2 client ID'
  client_secret: 'oAuth2 client secret'
  access_token: 'oAuth2 access token'
  tags: '#personal #fitness'
Notes:
  - Downloads your Exist data for today, and saves all attributes.
=end

config = {
  'description' => [
    'Exist.io Logger',
    'https://exist.io'
  ],
  'redirect_uri'  => "https://hackerific.net/slogger/exist/",
  'client_id'     => 'd26998cab3eaa34d5aca',
  'client_secret' => 'e854ed9aa67b1b4680734035dba6aa475b621a4e',
  'tags'          => '#personal #fitness'
}
$slog.register_plugin({ 'class' => 'ExistLogger', 'config' => config })

require 'rest-client'
require 'json'

class ExistLogger < Slogger
  # @config is available with all of the keys defined in "config" above
  # @timespan and @dayonepath are also available
  # returns: nothing
  def do_log
    if @config.key?(self.class.name)
      @exist_config = @config[self.class.name]
    else
      @log.warn("Exist has not been configured. Please authenticate by running on the command line.")
      return
    end

    # We need to have seen one run to have empty config, then we need to get a token
    if ! @exist_config.key?('access_token')
      return user_auth
    end

template = <<END
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
END

    data = grab_today
    entry = erb(template, data)

    @log.info("Logging Exist data")
    tags = config['tags'] || ''
    today = @timespan
    DayOne.new.to_dayone({ 'content' => entry })

  end

  def auth_url
    "https://exist.io/oauth2/authorize?response_type=code&client_id=#{@exist_config['client_id']}&redirect_uri=#{@exist_config['redirect_uri']}&scope=read"
  end

  def token_url
    "https://exist.io/oauth2/access_token"
  end

  def user_auth
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
        'client_id'     => @exist_config['client_id'],
        'client_secret' => @exist_config['client_secret'],
        'redirect_uri'  => @exist_config['redirect_uri'],
      }
    )

    # Return the interesting bits
    data = JSON.parse(response.to_str)
    config['access_token'] = data['access_token']
    config['expires']      = Time.now + data['expires_in']

    config
  end

  def grab_today
    begin
      today = RestClient::Request.execute(
        method: :get,
        url: 'https://exist.io/api/1/users/$self/today/',
        headers: {'Authorization' => "Bearer #{@exist_config['access_token']}" }
      )

      puts today
    rescue => e
      puts e.response
    end

    JSON.parse(today, object_class: OpenStruct)
  end


  def erb(template, vars)
    ERB.new(template, nil, '-').result(vars.instance_eval { binding })
  end
end
```

If I tweak this in future, changes will be on
[GitHub](https://github.com/mattfoster/Slogger/blob/master/plugins/existlogger.rb), rather than here.

So, there you have it, a slightly waffly drawn out journey through building a
command line based script which can authenticate with oAuth 2, and then convert
JSON data to Markdown. I hope you've enjoyed it!
