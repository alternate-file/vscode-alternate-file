export interface t {
  alternate: string | null;
  main: string;
  template: string[];
}
import * as FilePath from "./FilePath";

const dirnameRegex = /\{dirname\}\//g;
const basenameRegex = /\{basename\}/g;

export const alternatePath = (path: string) => ({
  main,
  alternate
}: t): FilePath.t | null =>
  alternatePathForSide(alternate, main, path) ||
  alternatePathForSide(main, alternate, path);

export const templateForPath = (path: string) => (pattern: t): string[] | null =>
  matchPath(pattern.main, path) && pattern.template ? pattern.template : null;

const alternatePathForSide = (
  pathPattern: string | null,
  alternatePattern: string | null,
  path: string
): FilePath.t | null => {
  if (!pathPattern || !alternatePattern) return null;

  const matches = matchPath(pathPattern, path);

  if (!matches) return null;

  const { dirname, basename } = matches;

  return alternatePattern
    .replace("{dirname}/", dirname ? dirname + "/" : "")
    .replace("{basename}", basename);
};

const matchPath = (
  pathPattern: string,
  path: string
): { dirname: string; basename: string } | null => {
  const regex = patternToRegex(pathPattern);
  const matches = path.match(regex);

  if (!matches || !matches[2]) return null;

  const dirname = matches[1];
  const basename = matches[2];

  return { dirname, basename };
};

const patternToRegex = (pathPattern: string): RegExp => {
  const regexPattern = pathPattern
    .replace(dirnameRegex, "(?:(.+)/)?")
    .replace(basenameRegex, "([^/]+)");
  return new RegExp(`^${regexPattern}$`);
};
