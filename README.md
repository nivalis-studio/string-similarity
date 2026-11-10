# @nivalis/string-similarity

String similarity helpers powered by [Dice's coefficient](https://en.wikipedia.org/wiki/S%C3%B8rensen%E2%80%93Dice_coefficient). Use it to rank fuzzy matches, measure duplicate content, or power smart suggestions with predictable, deterministic scoring.

## Highlights

- Modern TypeScript codebase with typed ESM builds
- Fast O(n) bigram comparison implementation
- Zero dependencies and side-effect free for optimal tree shaking
- Works anywhere a JavaScript runtime with ES2021 support is available

## Installation

```bash
# pick the package manager you prefer
bun add @nivalis/string-similarity
# or
npm install @nivalis/string-similarity
# or
pnpm add @nivalis/string-similarity
```

> The package is ESM-only. Use Node.js 18+, Bun, Deno, or a bundler that understands ESM.

## Quick Start

```ts
import { compareTwoStrings, findBestMatch } from '@nivalis/string-similarity';

const similarity = compareTwoStrings('healed', 'sealed');
// similarity === 0.8

const { ratings, bestMatch } = findBestMatch('healed', [
  'mailed',
  'sealed',
  'theatre',
]);

/* ratings === [
  { target: 'mailed', rating: 0.4 },
  { target: 'sealed', rating: 0.8 },
  { target: 'theatre', rating: 0.36363636363636365 },
] */
/* bestMatch === { target: 'sealed', rating: 0.8 } */
```

## API

### `compareTwoStrings(first: string, second: string): number`

Returns a score between 0 and 1. Whitespace is stripped before comparison and the order of arguments does not matter. When both inputs are empty or whitespace-only, the score is `1` only if the raw strings are strictly equal, and `0` otherwise (e.g. `'   '` vs `'\t'` scores `0`).

- **`first` / `second`**: Strings with at least two characters for the best signal
- **Returns**: `number` similarity score

```ts
compareTwoStrings('french', 'quebec');
// 0
compareTwoStrings('Olive-green table for sale, in extremely good condition.',
  'For sale: table in very good condition, olive green in colour.');
// 0.6060606060606061
```

### `findBestMatch(mainString: string, targetStrings: string[])`

Evaluates every entry in `targetStrings` and returns:

- `ratings`: ordered array of `{ target: string, rating: number }`
- `bestMatch`: the record with the highest rating
- `bestMatchIndex`: the index of `bestMatch` inside `targetStrings`

```ts
const result = findBestMatch('Olive-green table for sale, in extremely good condition.', [
  'For sale: green Subaru Impreza, 210,000 miles',
  'For sale: table in very good condition, olive green in colour.',
  'Wanted: mountain bike with at least 21 gears.',
]);

result.bestMatch.target;
// 'For sale: table in very good condition, olive green in colour.'
```

Invalid arguments throw an error. Pass a `mainString` that contains at least one non-whitespace character, and a non-empty array of strings.

## Algorithm Notes

- Based on bigram overlap (Dice coefficient) for predictable rankings
- Strips all whitespace before comparison. Repeated bigrams are counted, not collapsed: each occurrence must be matched separately, so `compareTwoStrings('aaaa', 'aa')` is `0.5`, not `1`
- Inputs are Unicode-normalized to NFC before comparison, so composed and decomposed forms of the same text (e.g. `'café'` in NFC vs NFD) score identically
- Known limitation: bigrams are formed from UTF-16 code units, so surrogate pairs (emoji and other astral-plane characters) are split across bigrams. Results stay deterministic and symmetric, but scores for emoji-heavy strings are approximate
- Complexity is O(n) relative to total input length, making it suitable for realtime UI filtering

## Development

```bash
bun install        # install dependencies
bun test           # run the Bun test suite
bun run lint       # biome static analysis
bun run build      # compile to dist/ via tsdown
```

Automated hooks are managed by Lefthook. See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed workflows, branch strategy, and release guidance.

## Roadmap

- Export an async/bulk API that can precompute bigrams for a target list and reuse them across multiple queries, reducing redundant work for search or autocomplete scenarios.

## Release Notes

> **Note**: The 5.1.0 and 5.2.0 packages on npm cannot be imported (`ERR_MODULE_NOT_FOUND`): their `package.json` points at `dist/index.js` and `dist/index.d.ts`, but the build inside the package is `dist/index.mjs` and `dist/index.d.mts`. Stay on 5.0.0 or move to the next release.

### Unreleased

- `compareTwoStrings` no longer scores two different empty or whitespace-only strings as identical: `compareTwoStrings('   ', '\t')` now returns `0` (it returned `1`). Strictly equal inputs, such as two empty strings, still score `1`
- `compareTwoStrings` normalizes both inputs to Unicode NFC before comparing, so composed and decomposed forms of the same text score `1`. For example, `'café'` written with a precomposed `é` (U+00E9) vs written as `e` plus a combining acute accent (U+0301) now returns `1` instead of `0.5714285714285714`
- The error thrown by `findBestMatch` for invalid arguments now reads `Bad arguments: mainString must be a non-empty string, targetStrings must be a non-empty array of strings` (previously `Bad arguments: First argument should be a string, second should be an array of strings`). Update any code that matches on the message text
- The published type of `findBestMatch(...).bestMatch` is now `{ target: string; rating: number }` instead of `{ target: string; rating: number } | undefined`, so TypeScript callers no longer need a null check. Runtime behaviour is unchanged
- Removed the `typescript` peer dependency; the package has no peer dependencies

### 5.2.0

- No changes to the library code; tests and documentation only

### 5.1.0

- `findBestMatch` now throws when `mainString` is empty or whitespace-only. In 5.0.0 it returned a rating of `0` for every target

### 5.0.0

- Converted the library to TypeScript and ESM-only exports
- Switched to named exports `compareTwoStrings` and `findBestMatch`
- Removed UMD/browser bundles in favor of modern bundler workflows

## License

MIT © Nivalis Studio
