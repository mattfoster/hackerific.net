---
author: mpf
date: 2016-05-08T12:19:04+01:00
draft: true
keywords:
- Day One
- Mac
- Journal
title: Splitting Day One exports
topics:
- Day One
type: post
---

There's no doubt in my mind that journalling is a really useful thing to do,
both for personal logging and keeping track of progress and decisions at work.

I've spent a bit of time experimenting, and I've tried various logging and journalling apps, including
[Quiver](http://happenapps.com), [Ulysses](http://ulyssesapp.com), rolling my
own using vim and one of the most popular Mac Journalling apps, [Day One](http://dayoneapp.com).

All of these have pros and cons, and for various reasons I can never settle
into sticking to just one methodology, so I'm currently using Day One for
personal logging, helped along by
[Slogger](http://brettterpstra.com/projects/slogger/) (mentioned previously in
[my post on Mac Dev Tools](https://hackerific.net/2016/02/13/mac-dev-tools/).

![Day One Export](/images/posts/day_one_export.png)

Recently, I decided to switch from Day One for work logging back to a flat-file
based system, where I just create files named things like
`2016-05-08-whatever-i-want-here.md', and keep any related files in directories
alongside. As part of this transition, I had several posts to get back out of
Day One, and so I went for its export function.

Now, exporting worked fine, but it dumped a zip file, containing a single plain
text file with all of my posts, and a directory of images. Not exactly useful
for putting in my flat formatted directory of text. I had a quick look into
other export options, including checking if Day One supports AppleScript (it
doesn't), then decided to whip up a script to split the text automatically. 

The result is a simple perl script, using only core perl libraries, which takes
a Day One input file and splits it into a directory of files with nicely
formatted date and time based names.

Here's the script, you can find the latest release on
[GitHub](https://github.com/mattfoster/dotfiles/blob/master/bin/day_one_splitter).

```perl
#! /usr/bin/env perl
use warnings;
use strict;

use File::Spec::Functions qw( catfile );
use Getopt::Long;
use Pod::Usage;
use Time::Piece;

# Default options
my $output_dir      = 'split';
my $suffix          = '.md';
my $filename_format = '%F-%H%M';
my ($help, $man);

GetOptions(
    'dir=s'        => \$output_dir,
    'suffix=s'     => \$suffix,
    'fmt|format=s' => \$filename_format,
    'help'         => \$help,
    'man'          => \$man
) or pod2usage(2);

pod2usage(1) if $help;
pod2usage(-exitval => 0, -verbose => 2) if $man;

if ( ! -d $output_dir) {
    pod2usage(-message => "Destination directory $output_dir doesn't exist");
}

my $input = shift @ARGV;

pod2usage(-message => "No input file specified.") unless $input;
pod2usage(-message => "Input file $input doesn't exist") unless -r $input;

my $date_string;
my $fh;
my $filename;
my $in_header = 0;

open(my $input_fh, '<', $input);

while (<$input_fh>) {
    # There's indentation in Day One's header blocks
    # This is handy to help distinguish them from HTTP responses!
    if (/^\tDate:\s*(.*)\s+(GMT|BST)$/) {

        $date_string = $1;

        # At the start of a header block we have a new entry, so close any open files
        close($fh) if $fh;

        # Now convert the date string to something we can use in a filename
        $filename = Time::Piece->strptime($date_string, "%d %B %Y at %T")->strftime($filename_format);

        my $output_filename = catfile($output_dir, $filename) . $suffix;
        if (-e $output_filename) {
            warn "Output filename $output_filename exists. Refusing to overwrite it and quitting instead!\n";
            last;
        }

        open($fh, ">", $output_filename);

        print { $fh } "---\n";
    }

    # If we're no longer in a header block, we need to close it
    if ($in_header && $_ !~ /^\t/) {
        $in_header = 0;
        $_ .= "---\n\n";
    }

    # Clean up Day One's front matter
    if (/^\t(Location|Date|Weather)/) {
        $_ =~ s{^\s+}{};
        $_ =~ s{\t}{ };
        $_ = lcfirst $_;
        $in_header++;
    }

    print { $fh } $_;
}

close($input_fh);

__END__

=head1 NAME 

day_one_splitter - split Day One exports

=head1 SYNOPSIS 

day_one_splitter [options] filename

  Options:
      --dir		Output directory (must exist)
      --suffix		Output file suffix
      --format		Output filename format (strftime format)
      --help	        Show help.

=head1 OPTIONS

=over 4

=item B<--dir>

Specify an output directory. This must exist, and defaults to S<split>.

=item B<--suffix>

Specify the filename suffix to use when writing output files.
Defaults to S<.md>.

=item B<--format>

Specify the format to use for output filenames. Defaults to
S<%F-%H%M>, which leads to filenames that look like: 
S<2016-12-31-1410.md> with the default S<.md> suffix.

=item B<--help>

Print this help.

=item B<--man>

Print more help, and page it.

=back

=head1 ABOUT

This script takes a Day One output file and splits it into one file per post
(ignoring images). Use it to split exports up for easy import into other
software, or use with flat file based journalling systems.

If your export zip has a photos directory, copy it along into your output
directory for working images.

This was written by Matt Foster S<mpf@hackerific.net>

=cut
```

# Info and features

Why perl? I spend a lot of time maintaining perl code, so it's the language I'm
currently most familiar with. That said, it could easily be reimplemented in
another scripting language without much effort.

The script works by looking for Day One's header blocks. These look like this:

```
	Date:	14 April 2016 at 11:33:57 BST
	Weather:	10°C Partly Cloudy
	Location:	27 Gay Street, Bath, England, United Kingdom
```

With tabs at the start of the line, and starting with the `Date` field. When it
detects a new header block the previous file is closed and a new one opened.
The filename of the new file is generated by parsing the date from the block
and converting it to a more univeral format, `%F-%H%M`, which looks like 
`2016-05-08-1249`.

As an added bonus for apps which support YAML front matter, the script also
adds YAML header blocks, so you can easily use the files with static site
generators.

Finally, the output directory, filename format and file suffix are all
tweakable, run the script with `--help` or `--man` for full details.

This is a pretty simple script, but hopefully it'll save some people a bit of
time.  Let me know if you have any questions.
