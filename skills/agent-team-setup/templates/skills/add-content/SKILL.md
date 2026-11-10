---
name: add-content
description: Add one routine content item — a post, a project, a docs page, a changelog entry — as a single file in {{CONTENT_DIR}}/ that passes the repo's schema, drafted from a URL, a file or a few answers, with one critic round. Use as /add-content <url | path | title>. This is the regular update; it never changes code.
---

# /add-content <url | path | title>

Adding content is adding one file. This skill makes that file correctly and nothing else.

## Steps

1. **Learn the shape.** Find the schema or the closest existing examples in `{{CONTENT_DIR}}/` (frontmatter fields, required keys, length caps, naming). Read two existing items; the new one must look like them.
2. **Gather.** If a URL or path was given, read it. For a GitHub repo: `gh repo view <url> --json name,description,url,primaryLanguage,repositoryTopics` and its README. Spawn `Explore` (Haiku, read-only) to summarise the source into the fields the schema needs. Facts only.
3. **Ask once.** In one message, ask {{OWNER}} only for what cannot be inferred: the one-line summary (offer a draft), anything personal, media paths, numbers to confirm. Never ask for a field you can fill from the source.
4. **Write** `{{CONTENT_DIR}}/<slug>.<ext>` with `builder-lite`, matching the schema and the examples. Respect every cap in `CLAUDE.md`'s laws.
5. **Check.** Run `{{CHECK_CMD}}`. If the schema rejects the file, fix the file, not the schema, and re-run.
6. **One critic round.** <!-- ui-only -->Run `{{SHOTS_CMD}}` for the states that show the new item, then <!-- /ui-only -->spawn `critic` with the file path and the name `content:<slug>`. Apply its findings to the file once with `builder-lite` at `effort: medium` (one level up from its default). No second round; leftover findings go in the report.
7. **Report:** the file path, what it is tagged or linked with, any shared lists it now appears in, and leftover findings. Do not commit or push unless {{OWNER}} says so.

## Rules

- Never invent facts, numbers, dates or collaborators. Not in the source and not from {{OWNER}} → leave the field out.
- Never edit any other content file, except a shared catalogue (tags, categories) when {{OWNER}} approves a new entry.
- Never touch code, and never let builder-lite touch it. If the content needs a code change to render, stop and suggest `/build-feature`.
