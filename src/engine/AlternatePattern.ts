import * as path from "path";
import * as utils from "./utils";
import { isError, ok, error, Result } from "result-async";

/**
 * A computer-friendly representation of paths for switching between alternate files.
 */
export interface t {
  main: string;
  alternate: string;
}

const slash = "[/\\]";
const notSlash = "[^/\\]";
const escapedSlash = "[/\\\\]";

const anyBackslashRegex = /\\/g;
const escapedBackslash = "\\\\";

const transformationPattern = "{([^{}]+)}";

const dirnameRegex = new RegExp(`{dirname}${escapedSlash}`, "g");
const basenameRegex = /{basename}/g;

const dirnamePattern = `(?:(.+)${slash})?`;
const basenamePattern = `(${notSlash}+)`;

/**
 * Given a filePath and an AlternatePath, calculate if the filePath matches
 * a pattern, and if it does, calculate what the matching alternate file path
 * would be.
 * @param path - the absolute path to the file
 * @param projectionsPath - the absolute path to the projections file
 * @param alternatePath - the AlternatePath object to match against.
 */
export const alternatePath = (path: string, projectionsPath: string) => ({
  main,
  alternate
}: t): string | null =>
  alternatePathForSide(alternate, main, path, projectionsPath) ||
  alternatePathForSide(main, alternate, path, projectionsPath);

const alternatePathForSide = (
  pathPattern: string,
  alternatePattern: string,
  filePath: string,
  projectionsPath: string
): string | null => {
  const absolutePattern = combinePaths(projectionsPath, pathPattern);
  const absoluteAlternatePattern = combinePaths(
    projectionsPath,
    alternatePattern
  );

  const matchResult = matchPatternToPath(absolutePattern, filePath);
  if (isError(matchResult)) return null;

  const pathMatches = matchResult.ok;
  const transformations = patternToTransformations(absolutePattern);

  return fillPattern(transformations, pathMatches, absoluteAlternatePattern);
};

/**
 * Take the available transformation names and match values, and use them to fill up the alternate pattern.
 * @param transformations
 * @param matches
 * @param alternatePattern
 * @returns A complete file path.
 */
const fillPattern = (
  transformations: string[],
  matches: string[],
  alternatePattern: string
): string => {
  const filledPath = utils
    .zip(transformations, matches)
    .reduce(
      (alternatePattern: string, [transformation, match]: [string, string]) =>
        alternatePattern.replace(`{${transformation}}`, match || ""),
      alternatePattern
    );

  return path.normalize(filledPath);
};

/**
 * Extract a list of transformations from a pattern, to be zipped with their matches.
 * @param pathPattern
 * @returns list of transformation names
 */
const patternToTransformations = (pathPattern: string) => {
  const regex = new RegExp(transformationPattern, "g");

  const transformations: string[] = [];
  let matches: RegExpExecArray | null;

  while ((matches = regex.exec(pathPattern)) !== null) {
    transformations.push(matches[1]);
  }

  return transformations;
};

/**
 * Take a path pattern string, and use it to try to pull out matches from the file path.
 * @param pathPattern - String to be converted to regex
 * @param filePath - Current file
 * @returns Ok(matches) | Error(null) if no matches
 */
const matchPatternToPath = (
  pathPattern: string,
  filePath: string
): Result<string[], null> => {
  const regex = patternToRegex(pathPattern);
  const matches = filePath.match(regex);

  if (!matches || !matches[2]) return error(null);

  const pathMatches = matches.slice(1);

  return ok(pathMatches);
};

/**
 * Take a projections pattern, and convert it to a regex that will extract the variable parts.
 */
const patternToRegex = (pathPattern: string): RegExp => {
  const regexPattern = pathPattern
    .replace(dirnameRegex, dirnamePattern)
    .replace(basenameRegex, basenamePattern);

  const escapedPattern = escapeBackslashes(regexPattern);

  return new RegExp(escapedPattern);
};

/**
 * Append a pattern to the absolute path of the projections file
 * @param projectionsPath - absolute path to the projections file
 * @param filePattern -
 */
const combinePaths = (projectionsPath: string, filePattern: string): string => {
  const projectionsDir = path.dirname(projectionsPath);
  return path.resolve(projectionsDir, filePattern);
};

/**
 * Escape backslashes before converting a string to a regex.
 */
const escapeBackslashes = (pattern: string): string =>
  pattern.replace(anyBackslashRegex, escapedBackslash);
