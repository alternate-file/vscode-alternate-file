/**
 * Pipeable console.log
 * @param args - Varadic args to tag the log with.
 * @param data - Final data to console.log
 */
export const log = (...args: any[]) => <T>(data: T): T => {
  const logArgs = args.concat([data]);
  console.log(...logArgs);
  return data;
};

/**
 * Async sleep
 * @param milliseconds
 */
export const sleep = (milliseconds: number): Promise<number> => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};

/**
 * Zip two arrays together. Output is the length of the first array.
 * @param array1
 * @param array2
 */
export const zip = <T, U>(array1: T[], array2: U[]): [T, U][] =>
  array1.map((a, i) => {
    const b = array2[i];
    return [a, b] as [T, U];
  });

/**
 * Pipeable version of String.replace
 * @param pattern - The pattern to replace
 * @param replacement  - The value to replace the pattern with
 * @returns the updated string.
 */
export const replace = (pattern: RegExp | string, replacement: string) => (
  string: string
): string => string.replace(pattern, replacement);
