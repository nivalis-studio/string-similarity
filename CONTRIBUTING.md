# Contributing to @nivalis/string-similarity

Thanks for helping improve the project! This document outlines the preferred development workflow so that changes can be reviewed and published quickly.

## Prerequisites

- Node.js 18+ or Bun 1.3+
- [Bun](https://bun.sh/) is the primary task runner (scripts call `bun`, `bun test`, etc.)
- Git installed and configured

Install dependencies once after cloning:

```bash
bun install
```

## Development Workflow

1. Create a feature branch from `main`.
2. Implement changes with TypeScript and keep the code side-effect free.
3. Run the quality gates locally:
   ```bash
   bun test           # unit tests
   bun run lint       # biome static analysis
   bun run ts         # type-check with tsc --noEmit
   bun run build      # compile with tsdown (should succeed before publishing)
   ```
4. Update docs (README, this guide, or changelog entries) when behavior changes.
5. Commit using conventional messages (see below) and open a pull request.

Lefthook enforces formatting and linting prior to each commit. If a hook modifies files, re-stage them and amend the commit.

## Commit Messages & Pull Requests

- Follow [Conventional Commits](https://www.conventionalcommits.org/) so `@commitlint` passes.
- Keep commits focused; split unintended changes into separate commits or PRs.
- Reference related issues in the PR description when possible.

## Coding Guidelines

- The project is ESM-only with strict TypeScript settings.
- Avoid default exports; expose named functions only.
- Minimize external dependencies — the runtime bundle should remain dependency-free.
- Add targeted unit tests for new behavior or regressions.
- Prefer descriptive variable names and concise comments for non-trivial logic.

### Testing precision

String similarity scores are floating-point values, so assert them with a deterministic tolerance instead of exact equality. Use `expect(score).toBeCloseTo(expected, 12)` (or round to the same number of decimal places) so that minor algorithm tweaks that only affect floating-point precision do not break the suite. Document any alternative tolerance you pick inline with the test so reviewers know the expected numeric precision.

## Release Process

1. Ensure `bun run build` succeeds and outputs the desired artifacts in `dist/`.
2. Bump the version in `package.json` following semver.
3. Update release notes in `README.md` (or a future changelog) with highlights.
4. Run `bun run prepack` (or rely on `npm publish`/`bun publish` invoking the `prepack` script) to generate fresh build files.
5. Publish with your package manager of choice (`npm publish`, `bun publish`, etc.).

## Questions?

Open an issue if you are unsure about an approach or want feedback before investing significant time. We are happy to help iterate on ideas early.
