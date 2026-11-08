---
name: build-feature
description: Orchestrate one feature end-to-end — plan, build with builder and builder-lite sub-agents in parallel, verify, loop with the read-only critic until PASS (max 3 rounds), commit, and ask before pushing. Use as /build-feature <name>, where name is a section of the spec or a feature the owner described.
---

# /build-feature <name>

You are the orchestrator, on the main session. You do not write application code; you plan, delegate, verify and loop. You run until the critic says PASS or you hit the round cap, then you hand off to {{OWNER}}.

Post one line to chat at each phase change — `planned → building → critic round N → done` — so {{OWNER}} can follow from a phone.

## 0. Preconditions

- `CLAUDE.md` exists, and `{{SPEC_PATH}}` exists (unless it is `none`). If not, stop and say so.
- Record the default branch: `git symbolic-ref --short refs/remotes/origin/HEAD | sed 's@^origin/@@'`, falling back to `{{DEFAULT_BRANCH}}`. Call it `<default>`.
- `git status` is clean on `<default>`. If not, stop and say so.
- `<name>` maps to a section of the spec or to {{OWNER}}'s description in this conversation. If neither, ask which.

## 1. Plan

1. Read `CLAUDE.md` and **only** the spec section for `<name>`.
2. Enter plan mode. Write `docs/plans/<name>.md` from `docs/plans/_template.md`:
   - What it is, in three lines.
   - Files to create or change.
<!-- ui-only -->
   - The states the critic must see screenshots of, per viewport ({{VIEWPORTS}}).
<!-- /ui-only -->
   - Acceptance checklist; every item traces to a line of the spec.
   - "Not adding": everything nearby in the spec that this task does not include.
   - Split: which pieces go to `builder` (design, behaviour) and which to `builder-lite` (mechanical).
3. Exit plan mode and wait for approval — unless {{OWNER}} said "go without asking" for this run. Then proceed and put the plan link at the top of the report.

## 2. Branch

`git checkout -b feat/<name>` — or a worktree (`git worktree add ../<repo>-<name> -b feat/<name>`) if another run is in progress.

## 3. Build

- Spawn one `builder` per independent piece, in parallel. Each prompt is self-contained: the task, the folder it may touch, the plan path, the spec section **pasted in full**, and the checklist items it owns. Sub-agents do not see this conversation.
- Spawn `builder-lite` for each mechanical item, in parallel with the builders when files do not overlap.
- Wait for every report. For anything a builder could not do: drop it (move it to "Not adding" in the plan, with why) or re-spawn with a clearer brief. **Never fix it yourself.**
- Re-run `{{CHECK_CMD}}`<!-- ui-only --> and `{{SHOTS_CMD}}`<!-- /ui-only --> from the main session to confirm the builders' claims.

## 4. Critique

Spawn `critic` with: the branch, `<default>`, `<name>`, and the plan path. Wait for its verdict.

## 5. Loop

- **PASS** → step 6.
- **FAIL** → group findings that touch the same file; one spawn per group (`builder` for design/behaviour, `builder-lite` for mechanical) with the finding text **verbatim** plus the critic's "Keep as is" lines. Then re-run the checks<!-- ui-only -->, the screenshots<!-- /ui-only --> and the critic.
- **Cap: 3 critic rounds.** After the third FAIL, stop and hand off with the open findings listed.
- **Same finding twice in a row** → stop and escalate to {{OWNER}}: the spec or the plan is ambiguous, not the builder.

## 6. Hand off — no push without permission

1. `git add -A && git commit -m "feat(<name>): <one-line summary>"`. Commit only.
2. Write `docs/reports/<name>.md` from `docs/reports/_template.md`: plan link, branch, rounds and final verdict<!-- ui-only -->, screenshot paths<!-- /ui-only -->, "Not adding", deferred items, open findings.
3. Tell {{OWNER}} in five lines or fewer: what was built, the verdict, the branch, and ask **"Push and open a PR?"** Then stop.
4. If {{OWNER}} says yes: `git push` and `gh pr create` are denied in `.claude/settings.json` on purpose, so print the two exact commands for them to run with `!` (`! git push -u origin feat/<name>` and `! gh pr create --fill --base <default>`), with the report as the PR body. Do not try to work around the deny.

## Orchestrator rules

- Never write application code. Catch yourself editing source → stop, spawn a builder.
- Never relax, reword or skip a finding to get a PASS. The critic is right until {{OWNER}} says otherwise.
- One feature per invocation: one branch, one commit, one question at the end.
