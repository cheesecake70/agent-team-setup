# {{PROJECT}} — working rules

The complete spec is `{{SPEC_PATH}}`. Read the section for whatever you are building before you write code. Do not invent features that are not in it.

## Laws (every change is checked against each, in order)

<!-- Numbered and stable: the critic tags findings LAW1, LAW2, … -->

**Law 1 — {{LAW_1_HEADLINE}}**
- {{checkable rule}}
- {{checkable rule}}

**Law 2 — {{LAW_2_HEADLINE}}**
- {{checkable rule}}
- {{checkable rule}}

<!-- Add Law 3 … Law 6 as needed. Each bullet must be checkable from a diff or a screenshot. -->

## Architecture contract

<!-- Folder boundaries the builders must respect, e.g. "src/apps/<name>/ never imports another app". -->
- {{boundary}}

## Process

- Plan before building: plan mode, plan written to `docs/plans/<name>.md`, wait for {{OWNER}}'s approval.
- One feature per branch (`feat/<name>`), worktree if another run is in progress.
- Nothing is committed without the `critic` agent returning PASS<!-- ui-only --> on screenshots at {{VIEWPORTS}}<!-- /ui-only -->.
- **Never push, merge, rebase or deploy without an explicit instruction from {{OWNER}}.**
- Never edit tests, fixtures or content to make a check pass; fix the code.
- Haiku agents (Explore, log-reader, builder-lite) never edit source code.
- Keep diffs small. One feature per commit.

## Commands

- `{{DEV_CMD}}` — dev server
- `{{CHECK_CMD}}` — tests + types + lint
<!-- ui-only -->
- `{{SHOTS_CMD}}` — screenshots into `{{SHOTS_DIR}}/`
<!-- /ui-only -->
- `{{BUILD_CMD}}` — production build
- Default branch: `{{DEFAULT_BRANCH}}`
