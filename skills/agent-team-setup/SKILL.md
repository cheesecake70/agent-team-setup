---
name: agent-team-setup
description: Install an orchestrator / builder / critic agent team into any repo — writes CLAUDE.md laws, three sub-agents (Sonnet builder, Haiku builder-lite, read-only Fable critic), the /build-feature, /critique and /add-content sub-skills, a screenshot script and push-proof permissions. Use when the person says "set up the agent team", "install agent-team-setup", or asks to upgrade an existing install.
---

# Agent team setup

A reusable way to build one feature at a time with sub-agents: the strongest model judges and never writes, cheaper models write and never judge, and nothing is pushed without the person saying so.

This skill only **installs**. The day-to-day work happens in the sub-skills it writes into the target repo:

| Sub-skill | Use | What it does |
| --- | --- | --- |
| `/build-feature <name>` | every feature | plan → branch → build in parallel → verify → critic loop (≤ 3 rounds) → commit → ask before push |
| `/critique [branch]` | any time | runs the critic alone on the current branch and prints the verdict; changes nothing |
| `/add-content <source>` | routine updates | adds one content file (a post, a project, a doc entry) that passes the repo's schema, with one critic round |

Every template lives in `templates/` next to this file. Read each one before writing it; never write from memory.

## Roles

| Role | File | Model | Tools | Job |
| --- | --- | --- | --- | --- |
| Orchestrator | the main session | opus (`claude --model opus`) | all, but only writes plans, reports, commits | plan, delegate, verify, loop, hand off |
| builder | `.claude/agents/builder.md` | sonnet | Read, Write, Edit, Glob, Grep, Bash | one scoped piece of code inside one folder |
| builder-lite | `.claude/agents/builder-lite.md` | haiku | Read, Write, Edit, Glob, Grep, Bash | mechanical work: types, lint, fixtures, content files |
| critic | `.claude/agents/critic.md` | fable | Read, Glob, Grep, Bash | `VERDICT: PASS` or a numbered fix list; cannot edit |

Why this split: the orchestrator holds context for the whole run, so it gets the long-context model. Judgement is the critic's whole job and it runs a few short times per feature, so it gets the strongest model and no edit tools, so it cannot rationalise its own fix. Builders never see the whole spec; they get one section and one checklist.

## Install

Run these in order. Each step is idempotent: if a target file exists, show a short diff of what would change and ask before overwriting. Never delete anything.

### 1. Learn the repo (ask once, in one message)

Read `CLAUDE.md`, `README*`, `package.json` / `pyproject.toml` / `Makefile` / `Cargo.toml`, and `git symbolic-ref --short refs/remotes/origin/HEAD` first, then ask only what you could not infer:

- **Owner** — the name the agents should hand off to.
- **Laws** — three to six rules every change must obey. If `CLAUDE.md` already has rules, propose them back as numbered laws rather than asking from scratch. Each law gets a one-line headline and two to five checkable bullets. Push back on laws that cannot be checked from a diff or a screenshot.
- **Spec** — the path to the spec / source of truth (e.g. `docs/spec.md`). If there is none, the orchestrator will take the person's description per feature; record `SPEC_PATH` as `none`.
- **Commands** — check (tests + types + lint), dev, build, and, for UI projects, a screenshot command.
- **UI?** — whether the project has screens. If yes, the screen sizes the critic must see (default: desktop 1440×900, mobile 390×844).
- **Content folder** — where routine content lives (e.g. `content/`, `posts/`), or `none`. Skip `/add-content` if none.

Record the answers as these values; every template uses them:

`OWNER`, `PROJECT`, `DEFAULT_BRANCH`, `SPEC_PATH`, `CHECK_CMD`, `DEV_CMD`, `BUILD_CMD`, `SHOTS_CMD`, `SHOTS_DIR` (default `.shots`), `VIEWPORTS`, `CONTENT_DIR`, `LAWS` (the numbered list).

### 2. `CLAUDE.md`

From `templates/CLAUDE.md`. If one exists, **merge**: keep everything the person wrote, add the missing sections (`## Laws`, `## Process`, `## Commands`) and the never-push line. The laws are numbered `Law 1 … Law N` — the critic tags findings with these numbers, so they must be stable.

### 3. Screenshots (UI projects only)

If the project has a UI and no screenshot command, write `scripts/shots.ts` from `templates/scripts/shots.ts`, add the `shots` script to the package manifest, and tell the person the one-time install line (`pnpm add -D playwright tsx && npx playwright install chromium`, or the npm/yarn equivalent). The critic cannot judge a UI it cannot see. States are passed as `?state=<name>`; tell the person the app has to honour that query in dev.

### 4. Agents

Write `.claude/agents/builder.md`, `builder-lite.md` and `critic.md` from `templates/agents/`. Fill the placeholders. For non-UI projects, delete the sections marked `<!-- ui-only -->` … `<!-- /ui-only -->` and the markers themselves.

### 5. Sub-skills

Write from `templates/skills/`:
- `.claude/skills/build-feature/SKILL.md`
- `.claude/skills/critique/SKILL.md`
- `.claude/skills/add-content/SKILL.md` — only if `CONTENT_DIR` is not `none`.

### 6. Plan and report templates

Write `docs/plans/_template.md` and `docs/reports/_template.md` from `templates/docs/`.

### 7. Permissions

Merge `templates/settings.json` into `.claude/settings.json`: replace the `{{…}}` command entries with the real commands, union the `allow` and `deny` arrays with any existing ones, and keep every other key untouched. Deny always wins in Claude Code, so the push/merge/rsync/ssh denies make "never push" a hard guarantee rather than a promise.

### 8. Verify and stop

- Every file has valid frontmatter and no `{{` left in it (`grep -rn '{{' .claude CLAUDE.md docs/plans docs/reports`).
- `.claude/settings.json` parses as JSON.
- Run the check command once so the person sees it works.

Show the person the list of files written or changed, then tell them: start with `claude --model opus`, then `/build-feature <first feature>`. Do not commit the install unless they ask.

## Upgrading an existing install

If `.claude/agents/critic.md` already exists, compare each installed file with its template and list what changed (new rules, renamed placeholders). Apply only what the person accepts. Never touch their laws without asking.

## Rules for the installer

- Never invent laws. Propose, then let the person confirm.
- Never write a placeholder value you guessed; ask, or mark it `TODO(<owner>)` and say so in the final list.
- Never commit, push, merge or deploy.
