---
author: mpf
date: 2016-04-30T09:19:08+01:00
keywords:
- git
- script
tags:
- git
title: 'Git file age: a script to show when files were last modified in git'
topics:
- git
type: post
---

Here's a script which prints a sorted list of the files in a git repository,
but sorted by when their last commit occurred, rather than the standard
modification, creation or access times you'd see from `ls`.
This will form the bases of another script in future, which will give me a list
of files that haven't been updated in git for a certain amount of time, but I
think this might be useful as-is to some people.

The script works by passing a list of files (currently supplied by
[ack](http://beyondgrep.com), which nicely filters out VCS files and
directories), through `xargs` to a non-standard `git log` line, which gets the
single most recent commit for the last file, along with the commit timestamp, and
abbreviated hash:

```
git log -1 --pretty="format:%ct       %cr     %h" static/images/rss.png
1453646325      3 months ago    1b2b259
```

These are all separated by tabs, and `xargs` also adds the filename, so the
full `xargs` looks like this:

```
ack -f |\
$FILTER |\
xargs -I § git log -1 --pretty="format:%ct	${format}	%h	§;" §
```

The filter variable is either set to `tee` with no arguments, which does
nothing, or `head -n 50`, when the script is run with its debug (`-d`) flag
set, as I found during testing on large repos that it can be *very* slow.

After outputting this data, it's sorted, which will use the timestamp in the
first column, and then piped through `cut -f 2-` to strip those timestamps, so
the output looks like this:

```
% git-file-age | tail -n 5
6 weeks ago	86e9ef9	content/post/false-positive-ports.md
5 weeks ago	1b32913	content/post/music-in-march.md
3 weeks ago	d3b88cc	content/post/xss-in-edgerouter.md
2 weeks ago	ef8fc8d	content/post/reading-list.md
3 days ago	fc577f4	content/post/launchbar-6-bookmarklets.md
```

Finally, I added a few arguments to reverse the sort order (`-r`), set a custom
time format (`-f`), and enable debug mode (`-d`). Using the `-f` argument, you
can set both commit and author times, for example `%cr` or `%ar`. See the
PRETTY FORMAT section of `git help log` for more examples.

Here's the full script:

```
#! /bin/bash

function main {
    local reverse=false format='%cr'
    DEBUG=false
    local helpstring="List files in a git repo along with when they were last updated.\n\t-d\tdebug mode (truncate input)\n\t-r\treverse sort order (default oldest first)\n\t-f\tset git date format string (e.g. %cr, %cd, etc.)\n\t-h\tdisplay this help.\n"

    OPTIND=1
    while getopts "drf:h" opt; do
        case $opt in
            d) DEBUG=true ;;
            r) reverse=true ;;
            f) format=$OPTARG ;;
            h) echo -e $helpstring; return;;
            *) return 1;;
        esac
    done
    shift $((OPTIND-1))

    readonly DEBUG

    # If debug is only process 50 filenames
    if $DEBUG; then
        FILTER='head -n 50'
    else
        FILTER='tee'
    fi

    ack_file_info $format | clean_input | sort_cleaned_input $reverse | clean_output
}

# Use ack's -f flag to just list files. We could use pretty much anything here,
# but I'm tempted to allow passing args to ack later
function ack_file_info {
    local format="$1"

    ack -f |\
    $FILTER |\
    xargs -I § git log -1 --pretty="format:%ct	${format}	%h	§;" §
}

# I'm not sure what goes one above, but on Mac OSX, the output of xargs loses
# its newlines when it's piped through a filter. So replace ; with \n as a
# bodge to fix this.
function clean_input {
    tr ';' '\n'
}

function sort_cleaned_input {
    local reverse="$1"

    if $reverse; then
        sort -r
    else
        sort
    fi
}

# Trim commit timestamps from output
function clean_output {
    cut -f 2-
}

main "$@"
```

You can also get this on [github](https://github.com/mattfoster/dotfiles/blob/master/bin/git-file-age).
