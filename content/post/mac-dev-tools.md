---
author: author
date: 2016-02-13T19:44:42Z
keywords:
- mac
- iterm
- omnifocus
- dash
tags:
- mac
title: Mac Dev Tools
topics:
- mac
type: post
---

I've written in the past about various bits of Mac software, but not recently.
This posts details some of the apps I use most days to make software
development easier.

## Background

I do most of my development work in virtual machines running [CentOS 7](https://www.centos.org/download/).
CentOS is a free distribution, based on [RHEL](https://www.redhat.com/en/technologies/linux-platforms/enterprise-linux),
and both of these are commonly used and rock-solid Linux distributions.

Because I tend to work on VMs, I tend to use an [SSH](http://www.openssh.com/)
client to connect to them, and so do most of my work remotely, on the command
line. As a result of that, I don't use all that many desktop apps, like flashy
text editors.

I've tried using tools like [ExpanDrive](http://www.expandrive.com/) to make
networked devices filesystem's accessible locally, but never really found it
worked for me, and similarly, while I love the idea of tools like
[Vagrant](https://www.vagrantup.com/) I've not yet managed to shoehorn them
into my workflow.

So, I could really do all my work using a Terminal Emulator like
[iTerm 2](https://www.iterm2.com/), and a web browser, but I actually don't,
because there are a few cool tools that make life a bit easier.

So, starting from the bottom, here's a list of some of my favourite dev tools.

## iTerm

[iTerm 2](https://www.iterm2.com/) is my favourite terminal emulator. I've
written about it [before](/tags/iterm/), and I'm sure I'll mention it again.

I love the support for coloured tabs and badges, and I like the idea of some of
the other advanced features it supports, like file download. I also find the "find"
function really handy when I'm looking at pages of text, like logs.

I currently use the
[Solarized Light](https://github.com/altercation/solarized/tree/master/iterm2-colors-solarized)
colour scheme, which I find more comfortable than schemes with a dark
background, and the [Hack](http://sourcefoundry.org/hack/) typeface, at 13
points. This provides me with a nice and comfortable interface to work in for
long periods.

![iterm screenshot](https://files.hackerific.net/iterm.png)

Inside iTerm I use [ZSH](http://www.zsh.org/), I've never been enamoured by
[Oh My Zsh](https://github.com/robbyrussell/oh-my-zsh), and instead I use a fork
of a toolkit called [zshkit](https://github.com/mattfoster/zshkit). I have lots
of custom functions and a minimalist prompt that also shows version control information.

I also use [vim](http://www.vim.org/) for editing files, with a whole suite of
plugins to make life easier, but this post isn't about the terminal, so let's move on!

## Sequel Pro

If you spend any amount of time administering, querying or developing with
databases and you don't use a GUI for it then you're missing out.

Having an app that can let you view (and edit) table contents, run queries and
view tables structure can save a massive amount of time.

I recommend [Sequel Pro](http://www.sequelpro.com/). Despite the 'Pro' in the
name, it's free and MIT licensed. You can find the source
[on github](https://github.com/sequelpro/sequelpro), and downloads builds on
the project's site.

On feature I'm looking forward to trying out is
[Bundles](http://www.sequelpro.com/bundles). These let you extend the core
functionality using custom scripts, which could be really handy.

## Dash

[Dash](https://kapeli.com/dash) is a pretty and quick documentation browser.
It integrates really well with Launchbar, which allows even quicker searches.

I primarily use it to read Ruby and Perl documentation, but the number of doc
sets it supports and will download for offline reading is immense.

It's definitely worth a look if you find console based documentation browsing
annoying, or if you want something you can use offline.


Now we're getting to apps which have a more tenuous link to direct dev work,
but which can still be a huge productivity boost!

## Launchbar

Despite recent changes to Spotlight, Apple will probably never replace third
party app launchers, like
[Launchbar](https://www.obdev.at/products/launchbar/index.html) and Alfred.
While I'm in no way an expert, or even power user, the ability to launch apps
and custom scripts quickly is not to be missed.

I prefer Launchbar's [Action Editor](https://www.obdev.at/products/launchbar/actions.html)
over the built in workflow management tools in Alfred, and so that's one of the main
reasons I stick with it. The other two are the clipboard history, which I find
immensely useful, and Instant Send. This lets you quickly send text or files to
apps, or other Launchbar actions. This means I can do things like select a CVE
reference in a file, then double tap Shift and type 'CVE' in order to have a
custom script run on the input. It's quick, and handy and I can think of
hundreds of things I should be using it for, in addition to the things I already do.

## Day One

I try, (and often fail), to keep notes on what I'm doing, both at work and at home.
I'm still experimenting with things here, but one app I keep going back to is
[Day One](http://dayoneapp.com/).

There are loads of articles on the benefits of regular journaling, detailing
heath reasons and catharsis, but I find the most important thing is being able
to look things up after the fact. It's extremely useful for problem solving if
you can see your reasoning written down, and it can help you explain why you did
something when someone asks you mother down the line. Think of it as a present from
your past self!

Day One feels a bit like it's designed for life logging, rather that fitting
into a techy lifestyle, but don't let that fool you. It has full support for
[Markdown](http://help.dayoneapp.com/markdown-guide/) and is easy to integrate
with handy tools like [Slogger](http://brettterpstra.com/projects/slogger/)
which automatically downloads online activity for storage. Definitely worth a
look.

## OmniFocus

It's easy to get swept up in all the hype surrounding GTD and productivity
tools, but that doesn't mean that these tools can't be really useful.

I find OmniFocus is a great way to dump tasks into a system I trust, and I like
the way I can sync between iOS and the Mac App. I'm trying to use it to keep
track of tasks in a way which helps me be less reactive while at work, and so far
it's working.

While I was getting started with using it, I found Joe Buhlig's
[Working With OmniFocus](https://tools.joebuhlig.com/working-with-omnifocus/?ref=2a32fe)
book really useful, but I'd recommend reading it when you understand the basics.
I also found this
[simplicitybliss](http://simplicitybliss.com/post/134986892272/omnifocus-resources-2016)
article really useful for learning resources.

I'm fairly sure that any trusted system would work fine for the type of task
management I do, but the premium you pay for [OmniGroup](https://www.omnigroup.com/) products,
and the user community surrounding them makes OmniFocus a solid choice, with good support.

## Wrap up

Hopefully this post has given you an insight into some of the ways I try to
support my (mostly remote) work with local tools. Hopefully it's also showed
that some dev tools might look like they have nothing to do with development.

Let me know with a comment if you know of anything I'd find useful!
