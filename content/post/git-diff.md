---
title: "Using git diff for unmanaged files"
date: 2020-04-17T10:24:17+01:00
tags:
 - git
---

I switched to [diff-so-fancy](https://github.com/so-fancy/diff-so-fancy) as my
git diff viewer a few days ago, and I love the way it handles whitespace
changes, and generally looks nice. The
[pro-tips](https://github.com/so-fancy/diff-so-fancy/blob/master/pro-tips.md)
page has info on installing via [zplug](https://github.com/zplug/zplug), which
is cool and worth a look as well.

So, I now have pretty git diffs, but did you know that `git diff` works outside
of repos? I didn't, and it's super handy! If you have two files, `aa` and `bb`,
you can diff them with `git diff aa bb` -- exactly as you'd use `diff
normally`, except that it'll use your configured diffing tool. Fancy!

![](/images/posts/diff.png)
