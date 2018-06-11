export interface t {
  src: string;
  spec: string;
}
import * as FilePath from "./FilePath";

export const alternatePath = (path: string) => ({
  src,
  spec
}: t): FilePath.t | null =>
  alternatePathForSide(spec, src, path) ||
  alternatePathForSide(src, spec, path);

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
