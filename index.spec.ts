/* eslint-disable @typescript-eslint/no-magic-numbers */
import { describe, expect, it } from 'bun:test';
import { compareTwoStrings, findBestMatch } from './index';

describe('compareTwoStrings', () => {
  it('is a function', () => {
    expect(typeof compareTwoStrings).toEqual('function');
  });

  it('returns the correct value for different inputs:', () => {
    const testData = [
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
        second:
          'For sale: table in very good  condition, olive green in colour.',
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
      { first: 'apple event', second: 'apple    event', expected: 1 },
      {
        first: 'iphone',
        second: 'iphone x',
        expected: 0.909_090_909_090_909_1,
      },
    ];

    for (const td of testData) {
      expect(compareTwoStrings(td.first, td.second)).toBe(td.expected);
    }
  });
});

describe('findBestMatch', () => {
  const badArgsErrorMsg =
    'Bad arguments: First argument should be a string, second should be an array of strings';

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

    expect(matches.ratings).toEqual([
      { target: 'mailed', rating: 0.4 },
      { target: 'edward', rating: 0.2 },
      { target: 'sealed', rating: 0.8 },
      { target: 'theatre', rating: 0.363_636_363_636_363_65 },
    ]);
  });

  it('returns the best match and its similarity rating', () => {
    const matches = findBestMatch('healed', [
      'mailed',
      'edward',
      'sealed',
      'theatre',
    ]);

    expect(matches.bestMatch).toEqual({ target: 'sealed', rating: 0.8 });
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
});
