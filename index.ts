/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable unicorn/prefer-string-slice */
/* eslint-disable no-param-reassign */
/* eslint-disable func-style */

function areArgsValid(
  mainString: string,
  targetStrings: Array<string>,
): boolean {
  if (typeof mainString !== 'string') {
    return false;
  }

  if (mainString.trim().length === 0) {
    return false;
  }

  if (!Array.isArray(targetStrings)) {
    return false;
  }

  if (targetStrings.length === 0) {
    return false;
  }

  return !targetStrings.some(str => typeof str !== 'string');
}

function compareTwoStrings(first: string, second: string): number {
  const normalizedFirst = first.replaceAll(/\s+/g, '');
  const normalizedSecond = second.replaceAll(/\s+/g, '');

  if (normalizedFirst === normalizedSecond) {
    return 1; // identical or empty
  }

  if (normalizedFirst.length < 2 || normalizedSecond.length < 2) {
    return 0; // if either is a 0-letter or 1-letter string
  }

  const firstBigrams = new Map<string, number>();

  for (let i = 0; i < normalizedFirst.length - 1; i++) {
    const bigram = normalizedFirst.substring(i, i + 2);
    const count = (firstBigrams.get(bigram) ?? 0) + 1;

    firstBigrams.set(bigram, count);
  }

  let intersectionSize = 0;

  for (let i = 0; i < normalizedSecond.length - 1; i++) {
    const bigram = normalizedSecond.substring(i, i + 2);
    const count = firstBigrams.get(bigram) ?? 0;

    if (count > 0) {
      firstBigrams.set(bigram, count - 1);

      intersectionSize += 1;
    }
  }

  return (
    (2 * intersectionSize) /
    (normalizedFirst.length + normalizedSecond.length - 2)
  );
}

function findBestMatch(mainString: string, targetStrings: Array<string>) {
  if (!areArgsValid(mainString, targetStrings)) {
    throw new Error(
      'Bad arguments: First argument should be a string, second should be an array of strings',
    );
  }

  const ratings: Array<{ target: string; rating: number }> = [];
  let bestMatchIndex = 0;
  let bestMatchRating = Number.NEGATIVE_INFINITY;

  for (const [i, currentTargetString] of targetStrings.entries()) {
    const currentRating = compareTwoStrings(mainString, currentTargetString);

    ratings.push({ target: currentTargetString, rating: currentRating });

    if (currentRating > bestMatchRating) {
      bestMatchRating = currentRating;
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
