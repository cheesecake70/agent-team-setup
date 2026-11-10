# Report: <name>

Plan: [`docs/plans/<name>.md`](../plans/<name>.md) · Mode: solo | team · Branch: `feat/<name>` · Commit: `<sha>`

## Verdict

<PASS | FAIL after 3 rounds> — critic rounds: <n>/3

| Round | Verdict | Findings | Fixed by (model · effort) |
| --- | --- | --- | --- |
| 1 | FAIL | LAW1 ×2, SPEC ×1 | builder · high |

## Cost

Session cost (`/cost`): <$> · Spawns:

| Agent | Model · effort | Count |
| --- | --- | --- |
| Explore | haiku · low | <n> |
| builder | sonnet · medium | <n> |
| critic | fable · high | <n> |

Track this across features: if team mode is not cheaper than solo for similar work, use solo more.

## Screenshots

- `.shots/<file>.png`

## Not adding

- <carried from the plan>

## Deferred / open findings

- <anything left, verbatim> — <"likely spec ambiguity" if it survived the model step-up>

## Next

Push and open a PR? (waiting for the owner)
