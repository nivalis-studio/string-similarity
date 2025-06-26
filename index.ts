/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable unicorn/prefer-string-slice */
/* eslint-disable no-param-reassign */
/* eslint-disable func-style */

function areArgsValid(mainString: string, targetStrings: string[]): boolean {
  if (typeof mainString !== 'string') return false;

  if (!Array.isArray(targetStrings)) return false;

  if (targetStrings.length === 0) return false;

  return !targetStrings.some(str => typeof str !== 'string');
}

function compareTwoStrings(first: string, second: string): number {
  first = first.replaceAll(/\s+/g, '');
  second = second.replaceAll(/\s+/g, '');

  if (first === second) return 1; // identical or empty

  if (first.length < 2 || second.length < 2) return 0; // if either is a 0-letter or 1-letter string

  const firstBigrams = new Map<string, number>();

  for (let i = 0; i < first.length - 1; i++) {
    const bigram = first.substring(i, i + 2);
    const count = firstBigrams.has(bigram) ? firstBigrams.get(bigram)! + 1 : 1;

    firstBigrams.set(bigram, count);
  }

  let intersectionSize = 0;

  for (let i = 0; i < second.length - 1; i++) {
    const bigram = second.substring(i, i + 2);
    const count: number = firstBigrams.has(bigram)
      ? firstBigrams.get(bigram)!
      : 0;

    if (count > 0) {
      firstBigrams.set(bigram, count - 1);

      intersectionSize += 1;
    }
  }

  return (2 * intersectionSize) / (first.length + second.length - 2);
}

function findBestMatch(mainString: string, targetStrings: string[]) {
  if (!areArgsValid(mainString, targetStrings)) {
    throw new Error(
      'Bad arguments: First argument should be a string, second should be an array of strings',
    );
  }

  const ratings = [];
  let bestMatchIndex = 0;

  for (const [i, currentTargetString] of targetStrings.entries()) {
    const currentRating = compareTwoStrings(mainString, currentTargetString);

    ratings.push({ target: currentTargetString, rating: currentRating });

    if (currentRating > ratings[bestMatchIndex]!.rating) {
      bestMatchIndex = i;
    }
  }

  const bestMatch = ratings[bestMatchIndex];

  return {
    ratings,
    bestMatch,
    bestMatchIndex,
  };
}

export { compareTwoStrings, findBestMatch };
