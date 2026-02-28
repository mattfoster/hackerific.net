---
author: mpf
date: 2016-08-26T10:10:58+01:00
keywords:
- git
- bash
tags:
- git
title: Cleaning git branches
type: post
---

The ubiquitous git (no, not a person) provides several tools for managing
repositories, but most of them operate at a fairly low-level.This means it's
often necessary to hack together quick scripts when there's something you need
to get done. I needed to remove a load of old, but merged, branches from some
remote (centrally hosted) repositories, so (in the words of the [slingshot
channel](http://www.slingshotchannel.com/)) "Let me show you what I came up
with!".

## Origins

To get git to list merged branches, you can use the `--merged` argument to `git
branch`, add `-r` and you only get merged remote branches:

```
git branch -r --merged
```

To get general information on remote branches, you can use `for-each-ref`, a
script which gives you information on objects defined in files within the
`.git/refs` directory. Have a look at the documentation and you'll see it can
easily be customised to display pretty much anything about a git object. In my
case, I want to display the name of the ref (so the branch name, basically),
and the date of the last commit:

```
git for-each-ref --sort=-committerdate refs/remotes --format="%(refname) %(committerdate:raw)"
```

Adding the `:raw` parameter to the committer date gets it as a unix timestamp
(with a timezone we can probably just ignore), like this:

```
refs/remotes/origin/master 1469033580 +0100
```

So, to delete merged branches, whose last commit is older than a certain date,
I need to take this output, filter out the branches I'm not interested in, and
then `join` the results with the output of the first command. This is pretty
simple, but there's a little bit of faffing about needed to make the outputs
from each command match up.

## The script

Here's the script as it currently stands, I've kept things divided up into
functions to make everything easier. It works by running the two commands
I mentioned above (cleaning the output to make sure they're the same).
Filtering by date is nice and easy, as both the GNU and BSD date functions let
you specify dates in the past, and I used the standard `while read` idiom along
with a simple `if` statement to decide what to keep and what to discard.
Next, I used the standard UNIX utility `join` to find branches which appear in both
the merged list, and the list of branches older than the configured limit.
Finally, it removes the branches from the remote using `git push`. I added
some basic argument parsing to allow setting the age of branches to remove and
only show what the script would *like* to do, rather than actually doing it,
and the result is shown below:

```bash
#! /bin/bash
# Deletes remote git branches which are older than 6 weeks and have been merged
#
# Author: Matt Foster <mpf@hackerific.net>

function process_args {
  while getopts ":hlw:" opt; do
    case $opt in
      w)
        WEEKS=$OPTARG
        ;;
      l)
        LIVE=1
        ;;
      h)
        usage
        exit 1
        ;;
      :)
        echo "Option -$OPTARG requires an argument." >&2
        usage
        exit 1
        ;;
    esac
  done

  WEEKS=${WEEKS:-6}
  LIVE=${LIVE:-0}

}

function usage {
  echo "Usage: purge-branches [-w <weeks>] [-l]" >&2
  echo "   -w <weeks> - remove merged brances whose latest commit is as least <weeks> weeks old" >&2
  echo "   -l         - actually remove the branches instead of just showing what to run" >&2
  echo "   -h         - show this help" >&2
}

function get_limit {
  unamestr=$(uname)
  if [[ "$unamestr" == 'Darwin' ]]; then
    LIMIT=$(date -j -v-${WEEKS}w +%s)
  else
    LIMIT=$(date --date="$WEEKS weeks ago" +%s)
  fi
}

function get_branches {
  git for-each-ref --sort=-committerdate refs/remotes --format="%(refname) %(committerdate:raw)"
}

function filter_by_date {
  while read branch date zone; do
    if [[ "$date" -le "$LIMIT" ]]; then
      echo $branch
    fi

  done
}

function clean_branch_name {
  sed -e 's~^\s\+~~'              \
  | sed -e 's~refs/~~'            \
  | sed -e 's~remotes/origin/~~'  \
  | sed -e 's~^origin/~~'
}

function merged_branches {
  git branch -r --merged
}

function delete_branches {
  while read branch; do
    if [[ "$LIVE" -eq "1" ]]; then
      git push origin --delete $branch
    else
      echo git push origin --delete $branch
    fi
  done
}


# Here's the main program!

process_args "$@"

get_limit

git fetch --all

old_branches=$(mktemp /tmp/purge-branches.XXXXXX)
merged_branches=$(mktemp /tmp/purge-branches.XXXXXX)

get_branches \
  | filter_by_date \
  | clean_branch_name \
  | sort \
  > $old_branches

merged_branches | fgrep -v ' -> ' | fgrep -v 'master' \
  | clean_branch_name \
  | sort \
  > $merged_branches

join $old_branches $merged_branches \
  | delete_branches
```

Hopefully it'll prove useful to others too.
