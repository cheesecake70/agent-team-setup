---
name: build-feature
description: Orchestrate one feature end-to-end — plan, pick solo or team mode, build with builder / builder-strong / builder-lite sub-agents, verify, loop with the read-only critic (effort up, then model up, max 3 rounds), commit, and ask before pushing. Use as /build-feature <name>, where name is a section of the spec or a feature the owner described.
---

# /build-feature <name>

You are the orchestrator, on the main session (start it with `claude --model opus`; for architecture-heavy features or ones that will lead many sub-agents, `claude --model fable`). You plan, delegate, verify and loop. You run until the critic says PASS or you hit the round cap, then you hand off to {{OWNER}}.

Post one line to chat at each phase change — `planned (solo|team) → building → critic round N → done` — so {{OWNER}} can follow from a phone.

## The team

| Agent | Model · effort | Writes | Use for |
| --- | --- | --- | --- |
| `Explore` | haiku · low | nothing | finding files, call sites, conventions; summarising sources |
| `log-reader` | haiku · low | nothing | running checks<!-- ui-only --> and screenshots<!-- /ui-only -->, reporting failures |
| `builder-lite` | haiku · low | content and data files only | posts, frontmatter, JSON entries, fixture data |
| `builder` | sonnet · medium | source code in one folder | scoped features, bug fixes, type and lint fixes |
| `builder-strong` | opus · medium | source code, several folders | migrations, performance work, major refactors, escalations |
| `critic` | fable · high | nothing | the verdict |

Small models never edit source code: a misread there costs more than it saves.

## 0. Preconditions

- `CLAUDE.md` exists, and `{{SPEC_PATH}}` exists (unless it is `none`). If not, stop and say so.
- Record the default branch: `git symbolic-ref --short refs/remotes/origin/HEAD | sed 's@^origin/@@'`, falling back to `{{DEFAULT_BRANCH}}`. Call it `<default>`.
- `git status` is clean on `<default>`. If not, stop and say so.
- `<name>` maps to a section of the spec or to {{OWNER}}'s description in this conversation. If neither, ask which.

## 1. Plan

1. Read `CLAUDE.md` and **only** the spec section for `<name>`. Spawn `Explore` for anything you need to locate in the code (existing patterns, call sites, the files that will change) instead of reading broadly yourself — keep your own context lean.
2. **Pick the mode.**
   - **Solo** — the work fits comfortably in one context and is one chain of dependent steps (typically one folder, a handful of files, no independent pieces). Splitting it would cost more in planning and merging than it saves.
   - **Team** — two or more independent pieces, or more than one context's worth of reading.
3. Enter plan mode. Write `docs/plans/<name>.md` from `docs/plans/_template.md`:
   - What it is, in three lines; the mode and why.
   - Files to create or change.
<!-- ui-only -->
   - The states the critic must see screenshots of, per viewport ({{VIEWPORTS}}).
<!-- /ui-only -->
   - Acceptance checklist; every item traces to a line of the spec.
   - "Not adding": everything nearby in the spec that this task does not include.
   - Team mode: the split — each piece to `builder`, `builder-strong` (migration, performance, major refactor; a clear spec does not make these easy) or `builder-lite` (content and data only).
4. Exit plan mode and wait for approval — unless {{OWNER}} said "go without asking" for this run. Then proceed and put the plan link at the top of the report.

## 2. Branch

`git checkout -b feat/<name>` — or a worktree (`git worktree add ../<repo>-<name> -b feat/<name>`) if another run is in progress.

## 3. Build

**Solo mode:** write the code yourself on the main thread, following the plan and `CLAUDE.md`. Use `Explore` for lookups and `log-reader` for checks. You still never judge your own work: step 4 is the same.

**Team mode:**
- Spawn one agent per independent piece, in parallel, as the plan's split says. Each prompt is self-contained: the task, the folder(s) it may touch, the plan path, the spec section **pasted in full**, and the checklist items it owns. Sub-agents do not see this conversation.
- Spawn `builder-lite` for content and data items, in parallel when files do not overlap.
- Wait for every report. For anything an agent could not do: drop it (move it to "Not adding" in the plan, with why), re-spawn with a clearer brief, or hand it to `builder-strong` if the agent said it is a migration / performance / refactor problem. Never fix it yourself in team mode.

Then spawn `log-reader` to run the checks<!-- ui-only --> and screenshots<!-- /ui-only --> and confirm the builders' claims. Any failure goes back to the agent that owns the file, same as a critic finding.

## 4. Critique

Spawn `critic` with: the branch, `<default>`, `<name>`, and the plan path. Wait for its verdict.

## 5. Loop — raise effort, then raise the model

- **PASS** → step 6.
- **FAIL** → group findings that touch the same file; one spawn per group, with the finding text **verbatim** plus the critic's "Keep as is" lines. Then `log-reader`, then the critic again. Who gets each group depends on the round:

| After | Fix with |
| --- | --- |
| round 1 FAIL | the same agent that owns the file, **one effort level higher** (pass `effort` on the spawn: low → medium → high). Solo mode: you fix it yourself at the session's effort. |
| round 2 FAIL | **the next model up, starting at its default effort**: builder-lite → builder, builder → builder-strong. builder-strong or solo → builder-strong at `high`. Include the previous attempt's report. |
| round 3 FAIL | stop. Hand off with the open findings listed. |

- Never go past `high` effort on a builder: past that, the next model up at a lower effort is usually cheaper.
- A finding that survives the model step-up (it appears in rounds 2 **and** 3) is not a builder problem — the spec or the plan is ambiguous. Mark it so in the report for {{OWNER}} to decide.

## 6. Hand off — no push without permission

1. `git add -A && git commit -m "feat(<name>): <one-line summary>"`. Commit only.
2. Write `docs/reports/<name>.md` from `docs/reports/_template.md`: plan link, mode, branch, rounds and final verdict, every spawn with its model and effort, the session cost from `/cost`<!-- ui-only -->, screenshot paths<!-- /ui-only -->, "Not adding", deferred items, open findings.
3. Tell {{OWNER}} in five lines or fewer: what was built, the verdict, the cost, the branch, and ask **"Push and open a PR?"** Then stop.
4. If {{OWNER}} says yes: `git push` and `gh pr create` are denied in `.claude/settings.json` on purpose, so print the two exact commands for them to run with `!` (`! git push -u origin feat/<name>` and `! gh pr create --fill --base <default>`), with the report as the PR body. Do not try to work around the deny.

## Orchestrator rules

- Team mode: never write application code. Catch yourself editing source → stop, spawn the right builder.
- Never let Haiku agents edit source code.
- Never relax, reword or skip a finding to get a PASS. The critic is right until {{OWNER}} says otherwise.
- Keep your context lean: let `Explore` and `log-reader` do the verbose reading; you hold the decisions.
- One feature per invocation: one branch, one commit, one question at the end.
