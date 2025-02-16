#!/bin/bash

set -e

cursor_file="./data/mastodon-post-cursor"

mastodon-markdown-archive \
	--user=https://${MASTODON_SERVER}/${MASTODON_USER} \
	--dist=./content/toot/ \
	--threaded=true \
	--exclude-replies=true \
	--exclude-reblogs=true \
	--persist-first=${cursor_file} \
	--since-id=$(test -f $cursor_file && cat $cursor_file || echo "") \
	--limit=40 \
	--download-media=bundle \
	--visibility=public
