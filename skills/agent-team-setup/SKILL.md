---
name: agent-team-setup
description: Install an orchestrator / builder / critic agent team into any repo — writes CLAUDE.md laws, six sub-agents (Haiku Explore and log-reader, Haiku builder-lite for content, Sonnet builder, Opus builder-strong, read-only Fable critic) with model and effort set per role, the /build-feature, /critique and /add-content sub-skills, a screenshot script and push-proof permissions. Use when the person says "set up the agent team", "install agent-team-setup", or asks to upgrade an existing install.
---

# Agent team setup

A reusable way to build one feature at a time: the strongest model judges and never writes, the right-sized model writes each piece, cheap models do the reading, and nothing is pushed without the person saying so.

This skill **installs**. The day-to-day work happens in the sub-skills it writes into the target repo:

| Sub-skill | Use | What it does |
| --- | --- | --- |
| `/build-feature <name>` | every feature | plan → solo or team → build → verify → critic loop (effort up, then model up, ≤ 3 rounds) → commit → ask before push |
| `/critique [branch]` | any time | runs the critic alone on the current branch and prints the verdict; changes nothing |
| `/add-content <source>` | routine updates | adds one content file (a post, a project, a doc entry) that passes the repo's schema, with one critic round |

## Where the templates are

Every file this skill writes comes from a template. Use the first source that exists:

1. A `templates/` folder next to this SKILL.md (the plugin install).
2. `~/.claude/skills/agent-team-setup/templates/`.
3. The source repo: `git clone --depth 1 https://github.com/cheesecake70/agent-team-setup /tmp/agent-team-setup` and use `/tmp/agent-team-setup/skills/agent-team-setup/templates/`.

Read each template before writing it; never write from memory. Placeholders are `{{UPPER_SNAKE}}`; `<!-- ui-only -->` … `<!-- /ui-only -->` marks blocks for projects with screens.

## Roles, models and effort

| Role | File | Model · effort | Writes | Job |
| --- | --- | --- | --- | --- |
| Orchestrator | the main session | opus (`claude --model opus`); fable for architecture-heavy work | plans, reports, commits; code only in solo mode | plan, delegate, verify, loop, hand off |
| Explore | `.claude/agents/explore.md` | haiku · low | nothing | search the code, summarise sources |
| log-reader | `.claude/agents/log-reader.md` | haiku · low | nothing | run checks and screenshots, report failures |
| builder-lite | `.claude/agents/builder-lite.md` | haiku · low | content and data files only | posts, frontmatter, JSON entries, fixture data |
| builder | `.claude/agents/builder.md` | sonnet · medium | source code in one folder | scoped features, bug fixes, type and lint fixes |
| builder-strong | `.claude/agents/builder-strong.md` | opus · medium | source code, several folders | migrations, performance, major refactors, escalations |
| critic | `.claude/agents/critic.md` | fable · high | nothing | `VERDICT: PASS` or a numbered fix list |

Why this split:
- Defaults follow Anthropic's model guide: Opus 5.5 is the default for complex work; Sonnet 5.5 for well-scoped, spec-driven tasks; Haiku 5.5 for search, logs, routing and side tasks; Fable 5.2 for the most ambitious work and for leading many sub-agents.
- **Small models never edit source code.** A misread costs more than it saves. Haiku reads, searches and writes content that a schema checks.
- The critic's whole job is judgement in a few short runs, so it gets the strongest model and no edit tools, so it cannot rationalise its own fix.
- **Effort before model.** Every agent starts at a modest effort. On failure the loop raises effort one level, then moves to the next model up at its default effort. It never goes past `high`, because beyond that the bigger model is usually cheaper.
- **Solo when small.** If a feature fits in one context and is one chain of dependent steps, the orchestrator builds it itself; the critic still judges.
- Aliases (`haiku`, `sonnet`, `opus`, `fable`) track the newest model in each family: Haiku/Sonnet/Opus 5.5, Fable 5.2. Never pin Fable 5.1, the previous generation.

## Install

Run these in order. Each step is idempotent: if a target file exists, show a short diff of what would change and ask before overwriting. Never delete anything.

### 1. Learn the repo (ask once, in one message)

Read `CLAUDE.md`, `README*`, `package.json` / `pyproject.toml` / `Makefile` / `Cargo.toml`, and `git symbolic-ref --short refs/remotes/origin/HEAD` first, then ask only what you could not infer:

- **Owner** — the name the agents should hand off to.
- **Laws** — three to six rules every change must obey. If `CLAUDE.md` already has rules, propose them back as numbered laws rather than asking from scratch. Each law gets a one-line headline and two to five checkable bullets. Push back on laws that cannot be checked from a diff or a screenshot.
- **Spec** — the path to the spec / source of truth (e.g. `docs/spec.md`). If there is none, the orchestrator takes the person's description per feature; record `SPEC_PATH` as `none`.
- **Commands** — check (tests + types + lint), dev, build, and, for UI projects, a screenshot command.
- **UI?** — whether the project has screens. If yes, the screen sizes the critic must see (default: desktop 1440×900, mobile 390×844).
- **Content folder** — where routine content lives (e.g. `content/`, `posts/`), or `none`. Skip `/add-content` if none.
- **Platform** — Anthropic API (default), or Amazon Bedrock / Google Cloud / Microsoft Foundry / Claude Platform on AWS.

Record the answers as these values; every template uses them:

`OWNER`, `PROJECT`, `DEFAULT_BRANCH`, `SPEC_PATH`, `CHECK_CMD`, `DEV_CMD`, `BUILD_CMD`, `SHOTS_CMD`, `SHOTS_DIR` (default `.shots`), `VIEWPORTS`, `CONTENT_DIR`, `LAWS` (the numbered list), `PLATFORM`.

### 2. `CLAUDE.md`

From `templates/CLAUDE.md`. If one exists, **merge**: keep everything the person wrote, add the missing sections (`## Laws`, `## Process`, `## Commands`) and the never-push line. The laws are numbered `Law 1 … Law N` — the critic tags findings with these numbers, so they must be stable.

### 3. Screenshots (UI projects only)

If the project has a UI and no screenshot command, write `scripts/shots.ts` from `templates/scripts/shots.ts`, add the `shots` script to the package manifest, and tell the person the one-time install line (`pnpm add -D playwright tsx && npx playwright install chromium`, or the npm/yarn equivalent). The critic cannot judge a UI it cannot see. States are passed as `?state=<name>`; tell the person the app has to honour that query in dev.

### 4. Agents

Write all six from `templates/agents/`: `explore.md` (agent name `Explore`, which replaces the built-in Explore so searches run on Haiku instead of the session model), `log-reader.md`, `builder-lite.md`, `builder.md`, `builder-strong.md`, `critic.md`. Fill the placeholders. For non-UI projects, delete the `<!-- ui-only -->` … `<!-- /ui-only -->` blocks and the markers; for UI projects, delete only the markers. Keep the `model:` and `effort:` lines as the template has them unless the person asks otherwise.

### 5. Sub-skills

Write from `templates/skills/`:
- `.claude/skills/build-feature/SKILL.md`
- `.claude/skills/critique/SKILL.md`
- `.claude/skills/add-content/SKILL.md` — only if `CONTENT_DIR` is not `none`.

### 6. Plan and report templates

Write `docs/plans/_template.md` and `docs/reports/_template.md` from `templates/docs/`.

### 7. Permissions and model pinning

Merge `templates/settings.json` into `.claude/settings.json`: replace the `{{…}}` command entries with the real commands, union the `allow` and `deny` arrays with any existing ones, and keep every other key untouched. Deny always wins in Claude Code, so the push/merge/rsync/ssh denies make "never push" a hard guarantee rather than a promise.

Model aliases differ by platform. On the Anthropic API, `haiku` means Haiku 5.5 and needs Claude Code v2.1.293 or later — check `claude --version` and tell the person to update if it is older. On Bedrock, Google Cloud, Foundry or Claude Platform on AWS, `haiku` still means Haiku 4.5: ask whether to pin Haiku 5.5 by setting `ANTHROPIC_DEFAULT_HAIKU_MODEL` in the settings file's `env` block to that platform's Haiku 5.5 model ID (ask for the exact ID; never guess it). After install, have the person run `/model` once to confirm what `fable` resolves to.

### 8. Verify and stop

- Every file has valid frontmatter and no `{{` left in it (`grep -rn '{{' .claude CLAUDE.md docs/plans docs/reports`).
- `.claude/settings.json` parses as JSON.
- Run the check command once so the person sees it works.

Show the person the list of files written or changed, then tell them: start with `claude --model opus` (or `fable` for architecture-heavy work), then `/build-feature <first feature>`. Mention that each report records cost, so after a few features they can see whether team mode, and the Fable critic, pay for themselves — and swap the critic to `opus` if it does not. Do not commit the install unless they ask.

## Upgrading an existing install

If `.claude/agents/critic.md` already exists, compare each installed file with its template and list what changed (new agents, new `effort:` lines, builder-lite's narrower scope, the escalation ladder). Apply only what the person accepts. Never touch their laws without asking.

## Rules for the installer

- Never invent laws. Propose, then let the person confirm.
- Never write a placeholder value you guessed — including model IDs; ask, or mark it `TODO(<owner>)` and say so in the final list.
- Never commit, push, merge or deploy.
