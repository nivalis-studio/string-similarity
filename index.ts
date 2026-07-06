function areArgsValid(mainString: unknown, targetStrings: unknown): boolean {
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

function normalizeInput(input: string): string {
  return input.normalize('NFC').replaceAll(/\s+/g, '');
}

function compareTwoStrings(first: string, second: string): number {
  const normalizedFirst = normalizeInput(first);
  const normalizedSecond = normalizeInput(second);

  if (normalizedFirst === normalizedSecond) {
    if (normalizedFirst.length === 0) {
      // both are empty or whitespace-only: only identical raw inputs match
      return first === second ? 1 : 0;
    }

    return 1; // identical after whitespace normalization
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

type Rating = { target: string; rating: number };

function findBestMatch(
  mainString: string,
  targetStrings: Array<string>,
): {
  ratings: Array<Rating>;
  bestMatch: Rating;
  bestMatchIndex: number;
} {
  if (!areArgsValid(mainString, targetStrings)) {
    throw new Error(
      'Bad arguments: mainString must be a non-empty string, targetStrings must be a non-empty array of strings',
    );
  }

  const ratings = targetStrings.map(target => ({
    target,
    rating: compareTwoStrings(mainString, target),
  }));

  let bestMatchIndex = 0;
  let bestMatchRating = Number.NEGATIVE_INFINITY;

  for (const [i, { rating }] of ratings.entries()) {
    if (rating > bestMatchRating) {
      bestMatchRating = rating;
      bestMatchIndex = i;
    }
  }

  // biome-ignore lint/style/noNonNullAssertion: areArgsValid guarantees targetStrings (and thus ratings) is non-empty
  const bestMatch = ratings[bestMatchIndex]!;

  return {
    ratings,
    bestMatch,
    bestMatchIndex,
  };
}

export { compareTwoStrings, findBestMatch };
