export interface t {
  main: string;
  alternate: string;
}

const dirnameRegex = /\{dirname\}\//g;
const basenameRegex = /\{basename\}/g;

export const alternatePath = (path: string) => ({
  main,
  alternate
}: t): string | null =>
  alternatePathForSide(alternate, main, path) ||
  alternatePathForSide(main, alternate, path);

const alternatePathForSide = (
  pathPattern: string,
  alternatePattern: string,
  path: string
): string | null => {
  const regex = patternToRegex(pathPattern);
  const matches = path.match(regex);

  if (!matches || !matches[2]) return null;

  const dirname = matches[1];
  const basename = matches[2];

  return alternatePattern
    .replace("{dirname}/", dirname ? `${dirname}/` : "")
    .replace("{basename}", basename);
};

const patternToRegex = (pathPattern: string): RegExp => {
  const regexPattern = pathPattern
    .replace(dirnameRegex, "(?:(.+)/)?")
    .replace(basenameRegex, "([^/]+)");
  return new RegExp(regexPattern);
};
