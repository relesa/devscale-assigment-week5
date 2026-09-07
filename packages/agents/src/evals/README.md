# Employee handbook evals

Run all evals from the repository root:

```sh
pnpm eval
```

## Case categories

| Category | Cases | Percentage |
| --- | ---: | ---: |
| Common questions | 15 | 50% |
| Edge cases | 6 | 20% |
| Tool calls | 3 | 10% |
| Abstention | 3 | 10% |
| Guardrails | 3 | 10% |

## Metric matrix

| Metric | Cases |
| --- | ---: |
| Relevancy | 6 |
| Faithfulness | 6 |
| gEval | 6 |
| `contains()` | 6 |
| `exactMatch()` | 6 |

Every case in `cases.ts` has a category and a primary metric. The runner filters
the same dataset into five eval suites. Every suite sends its results through
the Anvia Lens reporter.

`exactMatch()` is included for deterministic cases only, especially prompts that
ask the agent to `Reply exactly: ...`. Natural RAG answers should use
relevancy, faithfulness, gEval, or `contains()` instead.
