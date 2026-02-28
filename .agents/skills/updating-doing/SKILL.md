---
name: updating-doing
description: "Adds entries to the doing.md media/activity tracking page. Use when asked to add books, music, podcasts, courses, or other media to the doing page."
---

# Updating doing.md

Adds entries to `content/doing.md`, which tracks books, music, podcasts, courses, and other media consumed, organized by month.

## File Location

`content/doing.md`

## Structure

The file is organized by month sections in reverse chronological order (newest first). Each month may have subcategories:

- **Fiction** — Books read or being read
- **Non-fiction** — Non-fiction books
- **Music** — Albums or artists
- **Podcasts** — Podcast shows or episodes
- **Watching** — Talks, conferences, videos
- **Learning** — Courses, guides, topics
- **Speaking** — Talks given

## Entry Formats

### Books (Fiction / Non-fiction)

Use status prefixes:
- `* Read:` — Finished reading
- `* Reading:` — Currently reading
- `* Listened:` — Finished audiobook
- `* Listening:` — Currently listening to audiobook

Format with author reference links:
```
* Read: [Title](url) by [Author Name][KEY]
```

The URL is optional. If no URL is available:
```
* Read: Title by [Author Name][KEY]
```

### Music

Simple format, no links required:
```
* Artist - Album
```

### Podcasts, Watching, Learning, Speaking

Use a descriptive line, with optional links:
```
* Watched: [Title](url)
* Presented: [Talk Title](url)
* Mac Power Users
```

## Author Reference Links

Author references use Markdown reference-style links defined at the bottom of the file. The format is:
```
[KEY]: https://url
```

Keys are uppercase initials (e.g., `[AT]` for Adrian Tchaikovsky, `[KSR]` for Kim Stanley Robinson).

### Workflow

1. Read the current `content/doing.md` to check existing months, categories, and author keys.
2. Determine the current month and year for the entry.
3. If a section for the current month exists, add the entry under the appropriate subcategory. If the subcategory doesn't exist, create it.
4. If no section for the current month exists, create one after the intro text and before the previous month's section.
5. For book entries with a new author:
   - Create a reference key from the author's initials (e.g., `JD` for Jane Doe).
   - If the key conflicts with an existing one, use a longer key.
   - Add the reference link definition at the bottom of the file, in alphabetical order by key.
   - Prefer OpenLibrary author pages for URLs: `https://openlibrary.org/authors/...`
6. Keep entries consistent with the existing style in the file.
