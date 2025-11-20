# @nivalis/string-similarity

String similarity helpers powered by [Dice's coefficient](https://en.wikipedia.org/wiki/S%C3%B8rensen%E2%80%93Dice_coefficient). Use it to rank fuzzy matches, measure duplicate content, or power smart suggestions with predictable, deterministic scoring.

## Highlights

- Modern TypeScript codebase with typed ESM builds
- Fast O(n) bigram comparison implementation
- Zero dependencies and side-effect free for optimal tree shaking
- Works anywhere a JavaScript runtime with ES2020 support is available

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

Returns a score between 0 and 1. Whitespace is stripped before comparison and the order of arguments does not matter.

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

Invalid arguments throw an error. Pass a non-empty `mainString` and a non-empty array of strings.

## Algorithm Notes

- Based on bigram overlap (Dice coefficient) for predictable rankings
- Ignores whitespace and repeated bigrams to reduce noise
- Complexity is O(n) relative to total input length, making it suitable for realtime UI filtering

## Development

```bash
bun install        # install dependencies
bun test           # run the Bun test suite
bun run lint       # biome static analysis
bun run build      # compile to dist/ via tsdown
```

Automated hooks are managed by Lefthook. See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed workflows, branch strategy, and release guidance.

## Release Notes

### 5.0.0

- Converted the library to TypeScript and ESM-only exports
- Switched to named exports `compareTwoStrings` and `findBestMatch`
- Removed UMD/browser bundles in favor of modern bundler workflows

## License

MIT © Nivalis Studio
