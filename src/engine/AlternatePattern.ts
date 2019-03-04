import * as path from "path";

export interface t {
  main: string;
  alternate: string;
}

const dirnameRegex = /\{dirname\}\//g;
const basenameRegex = /\{basename\}/g;

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
  const absoluteFilePath = combinePaths(projectionsPath, filePath);
  const absolutePattern = combinePaths(projectionsPath, pathPattern);
  const absoluteAlternatePattern = combinePaths(
    projectionsPath,
    alternatePattern
  );

  const regex = patternToRegex(absolutePattern);
  const matches = absoluteFilePath.match(regex);

  if (!matches || !matches[2]) return null;

  const dirname = matches[1];
  const basename = matches[2];

  return absoluteAlternatePattern
    .replace("{dirname}/", dirname ? `${dirname}/` : "")
    .replace("{basename}", basename);
};

const patternToRegex = (pathPattern: string): RegExp => {
  const regexPattern = pathPattern
    .replace(dirnameRegex, "(?:(.+)/)?")
    .replace(basenameRegex, "([^/]+)");
  return new RegExp(regexPattern);
};

const combinePaths = (projectionsPath: string, filePattern: string): string => {
  const projectionsDir = path.dirname(projectionsPath);
  return path.resolve(projectionsDir, filePattern);
};
