---
name: critique
description: Run the read-only critic on the current branch (or a named one) and print its verdict, without fixing anything. Use as /critique [branch] to get a second opinion before a PR, after hand edits, or on someone else's branch.
---

# /critique [branch]

A dry run of step 4 of `/build-feature`. Changes nothing.

1. Branch = the argument, or the current branch. Default branch = `git symbolic-ref --short refs/remotes/origin/HEAD | sed 's@^origin/@@'`, falling back to `{{DEFAULT_BRANCH}}`. If they are the same branch, stop: there is no diff to judge.
2. Feature name = the branch name without `feat/`. Plan = `docs/plans/<name>.md` if it exists; otherwise tell the critic there is no plan and to judge against `CLAUDE.md` and the spec only.
<!-- ui-only -->
3. Run `{{SHOTS_CMD}}` so the screenshots match the branch. If the dev server is needed and not running, start `{{DEV_CMD}}` in the background first and stop it afterwards.
<!-- /ui-only -->
4. Spawn `critic` with the branch, the default branch, the name and the plan path.
5. Print the critic's output verbatim. Below it, one line: how many findings per tag, and "Run `/build-feature <name>` to fix, or fix by hand and `/critique` again."

Rules: never edit files, never commit, never spawn a builder. If {{OWNER}} asks to fix the findings, say that `/build-feature` does that with the round cap and the hand-off.
