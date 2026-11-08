# agent-team-setup

A Claude Code skill that installs a small agent team into any repo and gives you one command to build a feature with it:

- **Opus** plans and orchestrates — and never writes app code.
- **Sonnet** and **Haiku** build — and never judge their own work.
- **Fable** critiques, read-only — it can't edit, so it can't talk itself into a fix.
- **Nothing is pushed** without you. `git push`, merge, rebase and deploy are denied in settings, not just discouraged.

## How a feature gets built

```mermaid
flowchart TD
    start(["/build-feature &lt;name&gt;"]) --> plan
    plan["<b>Plan</b> · Orchestrator (Opus)<br/>docs/plans/&lt;name&gt;.md"] --> approve{"You approve?"}
    approve -- "yes" --> branch["<b>Branch</b><br/>feat/&lt;name&gt;"]
    approve -- "edit" --> plan
    branch --> builder["<b>builder</b> · Sonnet<br/>scoped code, one folder"]
    branch --> lite["<b>builder-lite</b> · Haiku<br/>types, lint, fixtures, content"]
    builder --> verify
    lite --> verify
    verify["<b>Verify</b> · Orchestrator<br/>re-run checks + screenshots"] --> critic
    critic["<b>critic</b> · Fable<br/>read-only: diff + screenshots vs. your laws"] --> verdict{"Verdict"}
    verdict -- "FAIL · rounds ≤ 3<br/>findings verbatim" --> builder
    verdict -- "same finding twice<br/>or 3rd FAIL" --> escalate(["Stop and escalate to you"])
    verdict -- "PASS" --> commit["<b>Commit</b> on feat/&lt;name&gt;<br/>docs/reports/&lt;name&gt;.md"]
    commit --> ask(["“Push and open a PR?”<br/>you run the push"])

    classDef orch fill:#EEEDFE,stroke:#534AB7,color:#3C3489
    classDef build fill:#E1F5EE,stroke:#0F6E56,color:#085041
    classDef judge fill:#FAECE7,stroke:#993C1D,color:#712B13
    classDef you fill:#F1EFE8,stroke:#5F5E5A,color:#444441
    class plan,branch,verify,commit orch
    class builder,lite build
    class critic judge
    class start,approve,ask,escalate,verdict you
```

<sub>Purple: orchestrator · Teal: writes code · Coral: judges, never writes · Gray: you</sub>

## The team

| Role | Model | Can write? | Job |
| --- | --- | --- | --- |
| Orchestrator | `opus` (your main session) | plans, reports, commits only | plan, delegate, verify, loop, hand off |
| `builder` | `sonnet` | yes, inside its assigned folder | one scoped piece of code |
| `builder-lite` | `haiku` | yes, mechanical only | types, lint, fixtures, content files |
| `critic` | `fable` | **no** — Read, Glob, Grep, Bash | `VERDICT: PASS` or a numbered fix list tagged by law |

The critic judges against **your laws**: three to six numbered, checkable rules in `CLAUDE.md` (e.g. "Law 2 — Show, don't write: a project highlight is one line"). Findings come back as `[LAW2] hero.tsx:14 — 41-word intro — cut to the first clause`, so every fix is specific and traceable.

## What gets installed in your repo

```mermaid
flowchart LR
    skill(["/agent-team-setup"]) --> claude["CLAUDE.md<br/>laws · process · commands"]
    skill --> agents[".claude/agents/<br/>builder · builder-lite · critic"]
    skill --> subs[".claude/skills/<br/>build-feature · critique · add-content"]
    skill --> settings[".claude/settings.json<br/>allow checks · deny push/merge/ssh"]
    skill --> docs["docs/plans/_template.md<br/>docs/reports/_template.md"]
    skill -.->|UI projects| shots["scripts/shots.ts<br/>Playwright, every viewport"]
```

| Sub-skill | When | What it does |
| --- | --- | --- |
| `/build-feature <name>` | every feature | the full loop above |
| `/critique [branch]` | before a PR, after hand edits | runs the critic alone and prints the verdict; changes nothing |
| `/add-content <url \| path \| title>` | routine updates | adds one schema-valid content file (post, project, docs page) with one critic round |

## Install the skill

**As a plugin** (Claude Code):

```
/plugin marketplace add cheesecake70/agent-team-setup
/plugin install agent-team-setup@agent-team-setup
```

**Or copy it** into your personal skills:

```bash
git clone https://github.com/cheesecake70/agent-team-setup
cp -r agent-team-setup/skills/agent-team-setup ~/.claude/skills/
```

## Use it

```bash
cd your-repo
claude --model opus
```

1. `/agent-team-setup` — it reads your repo, then asks once for your laws, spec path, check/dev/build/screenshot commands and viewports. It writes the files above and merges with anything you already have.
2. `/build-feature <name>` — plan → approve → build → critic loop → commit → it asks before pushing.
3. `/critique` or `/add-content` whenever you need them.

Change any agent's model in its frontmatter (`.claude/agents/*.md`).

## Repo layout

```
.claude-plugin/            plugin + marketplace manifests
skills/agent-team-setup/
├── SKILL.md               the installer
└── templates/
    ├── CLAUDE.md
    ├── settings.json
    ├── agents/            builder.md · builder-lite.md · critic.md
    ├── skills/            build-feature/ · critique/ · add-content/
    ├── scripts/shots.ts
    └── docs/              plans/_template.md · reports/_template.md
```

Templates use `{{PLACEHOLDERS}}` (`OWNER`, `CHECK_CMD`, `SHOTS_CMD`, `VIEWPORTS`, …) that the installer fills, and `<!-- ui-only -->` blocks it strips for projects without screens.

## Rules the team never breaks

- The orchestrator never writes application code.
- Nobody relaxes a critic finding to get a PASS.
- Max 3 critic rounds; the same finding twice means the spec is ambiguous, and you decide.
- One feature, one branch, one commit, one question at the end.
- Never push, merge, rebase or deploy without you.

Inspired by a portfolio build where the two laws were *"they always know where to look"* and *"show, don't write"*.
