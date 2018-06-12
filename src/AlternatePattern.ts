export interface t {
  main: string;
  alternate: string;
}
import * as FilePath from "./FilePath";

export const alternatePath = (path: string) => ({
  main,
  alternate
}: t): FilePath.t | null =>
  alternatePathForSide(alternate, main, path) ||
  alternatePathForSide(main, alternate, path);

const alternatePathForSide = (
  pathPattern: string,
  alternatePattern: string,
  path: string
): FilePath.t | null => {
  const regex = patternToRegex(pathPattern);
  const matches = path.match(regex);

  if (!matches || !matches[1]) return null;

  const core = matches[1];

  return alternatePattern.replace("*", core);
};

const patternToRegex = (pathPattern: string): RegExp => {
  const regexPattern = pathPattern.replace("*", "(.+)");
  return new RegExp(regexPattern);
};
