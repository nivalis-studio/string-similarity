import { describe, expect, it } from 'bun:test';
import { compareTwoStrings, findBestMatch } from './index';
import type { BestMatch, Rating } from './index';

// Decimal places for float score comparisons (see CONTRIBUTING.md, "Testing precision").
const PRECISION = 12;

// Builds the expected rating object with a tolerance-based rating matcher.
const closeRating = ({
  target,
  rating,
}: {
  target: string;
  rating: number;
}) => ({
  target,
  rating: expect.closeTo(rating, PRECISION),
});

const cases: Array<{ first: string; second: string; expected: number }> = [
  { first: 'french', second: 'quebec', expected: 0 },
  { first: 'france', second: 'france', expected: 1 },
  { first: 'fRaNce', second: 'france', expected: 0.2 },
  { first: 'healed', second: 'sealed', expected: 0.8 },
  {
    first: 'web applications',
    second: 'applications of the web',
    expected: 0.787_878_787_878_787_8,
  },
  {
    first: 'this will have a typo somewhere',
    second: 'this will huve a typo somewhere',
    expected: 0.92,
  },
  {
    first: 'Olive-green table for sale, in extremely good condition.',
    second: 'For sale: table in very good  condition, olive green in colour.',
    expected: 0.606_060_606_060_606_1,
  },
  {
    first: 'Olive-green table for sale, in extremely good condition.',
    second: 'For sale: green Subaru Impreza, 210,000 miles',
    expected: 0.255_813_953_488_372_1,
  },
  {
    first: 'Olive-green table for sale, in extremely good condition.',
    second: 'Wanted: mountain bike with at least 21 gears.',
    expected: 0.141_176_470_588_235_3,
  },
  {
    first: 'this has one extra word',
    second: 'this has one word',
    expected: 0.774_193_548_387_096_8,
  },
  { first: 'a', second: 'a', expected: 1 },
  { first: 'a', second: 'b', expected: 0 },
  { first: '', second: '', expected: 1 },
  { first: 'a', second: '', expected: 0 },
  { first: '', second: 'a', expected: 0 },
  { first: '   ', second: '\t', expected: 0 },
  { first: '  ', second: '  ', expected: 1 },
  { first: '   ', second: 'a', expected: 0 },
  { first: 'apple event', second: 'apple    event', expected: 1 },
  {
    first: 'café noir',
    second: 'café\u00A0noir',
    expected: 1,
  },
  {
    first: '東京\u3000駅',
    second: '東京駅',
    expected: 1,
  },
  {
    first: 'iphone',
    second: 'iphone x',
    expected: 0.909_090_909_090_909_1,
  },
  {
    // NFC (composed é) vs NFD (e + combining acute accent)
    first: 'café',
    second: 'cafe\u0301',
    expected: 1,
  },
  {
    // decomposed vs composed pair inside a longer string
    first: 'un café noir bien serré',
    second: 'un cafe\u0301 noir bien serre\u0301',
    expected: 1,
  },
];

describe('compareTwoStrings', () => {
  it('is a function', () => {
    expect(typeof compareTwoStrings).toEqual('function');
  });

  it.each(cases)('scores %j', ({ first, second, expected }) => {
    expect(compareTwoStrings(first, second)).toBeCloseTo(expected, PRECISION);
  });

  it.each(cases)('is symmetric for %j', ({ first, second }) => {
    expect(compareTwoStrings(second, first)).toBeCloseTo(
      compareTwoStrings(first, second),
      PRECISION,
    );
  });

  it.each(cases)('stays within [0, 1] for %j', ({ first, second }) => {
    const score = compareTwoStrings(first, second);

    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });
});

describe('findBestMatch', () => {
  const badArgsErrorMsg =
    'Bad arguments: mainString must be a non-empty string, targetStrings must be a non-empty array of strings';

  it('is a function', () => {
    expect(typeof findBestMatch).toBe('function');
  });

  it('accepts a string and an array of strings and returns an object', () => {
    const output = findBestMatch('one', ['two', 'three']);

    expect(typeof output).toBe('object');
  });

  it("throws a 'Bad arguments' error if no arguments passed", () => {
    expect(() => {
      // @ts-expect-error Invalid arguments
      findBestMatch();
    }).toThrowError(badArgsErrorMsg);
  });

  it("throws a 'Bad arguments' error if first argument is not a non-empty string", () => {
    expect(() => {
      // @ts-expect-error Invalid arguments
      findBestMatch('');
    }).toThrowError(badArgsErrorMsg);

    expect(() => {
      findBestMatch('', ['foo']);
    }).toThrowError(badArgsErrorMsg);

    const invalidMainArgument = 8;

    expect(() => {
      // @ts-expect-error Invalid arguments
      findBestMatch(invalidMainArgument);
    }).toThrowError(badArgsErrorMsg);
  });

  it("throws a 'Bad arguments' error if second argument is not an array with at least one element", () => {
    expect(() => {
      // @ts-expect-error Invalid arguments
      findBestMatch('hello', 'something');
    }).toThrowError(badArgsErrorMsg);

    expect(() => {
      findBestMatch('hello', []);
    }).toThrowError(badArgsErrorMsg);
  });

  it("throws a 'Bad arguments' error if second argument is not an array of strings", () => {
    expect(() => {
      // @ts-expect-error Invalid arguments
      findBestMatch('hello', [2, 'something']);
    }).toThrowError(badArgsErrorMsg);
  });

  it('assigns a similarity rating to each string passed in the array', () => {
    const matches = findBestMatch('healed', [
      'mailed',
      'edward',
      'sealed',
      'theatre',
    ]);

    expect(matches.ratings).toEqual(
      [
        { target: 'mailed', rating: 0.4 },
        { target: 'edward', rating: 0.2 },
        { target: 'sealed', rating: 0.8 },
        { target: 'theatre', rating: 0.363_636_363_636_363_65 },
      ].map(closeRating),
    );
  });

  it('returns the best match and its similarity rating', () => {
    const matches = findBestMatch('healed', [
      'mailed',
      'edward',
      'sealed',
      'theatre',
    ]);

    expect(matches.bestMatch).toEqual(
      closeRating({ target: 'sealed', rating: 0.8 }),
    );
  });

  it('returns the index of best match from the target strings', () => {
    const matches = findBestMatch('healed', [
      'mailed',
      'edward',
      'sealed',
      'theatre',
    ]);

    expect(matches.bestMatchIndex).toBe(2);
  });

  it('always returns a defined bestMatch, even for a single-element target list', () => {
    const matches = findBestMatch('healed', ['sealed']);

    expect(matches.bestMatch).toEqual(
      closeRating({ target: 'sealed', rating: 0.8 }),
    );
    expect(matches.bestMatchIndex).toBe(0);
  });
});

describe('exported types', () => {
  it('exposes Rating and BestMatch for findBestMatch results', () => {
    const result: BestMatch = findBestMatch('healed', ['sealed']);
    const best: Rating = result.bestMatch;

    expect(best).toEqual({ target: 'sealed', rating: 0.8 });
  });
});
