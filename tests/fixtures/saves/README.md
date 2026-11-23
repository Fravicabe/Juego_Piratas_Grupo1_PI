# Save fixtures

Frozen localStorage payloads used by `tests/core/saveLoad.fixtures.test.ts`.

| File      | Schema | Shape                                                                                            |
| --------- | ------ | ------------------------------------------------------------------------------------------------ |
| `v1.json` | 1      | `sailing` + `gathering`, no `activeSkillId`, no `worldAccumulatorMs`                             |
| `v2.json` | 2      | Adds `bargaining`, `activeSkillId` and `worldAccumulatorMs`; islands use the old `unlocked` flag |
| `v3.json` | 3      | Current shape: resource-based island unlocks (`unlockCost`, `requiresIslandId`)                  |

Do not edit these files to match new code. They represent saves that may already
exist in players' browsers; migration code must adapt to them.
