import * as path from "path";

/**
 * A computer-friendly representation of paths for switching between alternate files.
 */
export interface t {
  main: string;
  alternate: string;
}

const slash = "/";
const backslash = "\\\\";
const anyBackslashRegex = new RegExp(backslash, "g");

const dirnameRegex = new RegExp(
  `{dirname}(?:${slash}|${backslash}${backslash})`,
  "g"
);
const basenameRegex = /{basename}/g;

const dirnamePattern = `(?:(.+)[${slash}${backslash}])?`;
const basenamePattern = `([^${slash}${backslash}]+)`;

/**
 * Use an AlternatePath to find a possible alternate path for a file.
 * @param path
 * @param projectionsPath
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

  const regex = patternToRegex(absolutePattern);
  const matches = filePath.match(regex);

  if (!matches || !matches[2]) return null;

  const dirname = matches[1];
  const basename = matches[2];

  return path.normalize(
    absoluteAlternatePattern
      .replace(dirnameRegex, dirname ? `${dirname}/` : "")
      .replace(basenameRegex, basename)
  );
};

const patternToRegex = (pathPattern: string): RegExp => {
  const regexPattern = pathPattern
    .replace(dirnameRegex, dirnamePattern)
    .replace(basenameRegex, basenamePattern);
  return new RegExp(regexPattern);
};

const combinePaths = (projectionsPath: string, filePattern: string): string => {
  const projectionsDir = path.dirname(projectionsPath);
  const fullPath = path.resolve(projectionsDir, filePattern);

  return fullPath.replace(anyBackslashRegex, backslash);
};
