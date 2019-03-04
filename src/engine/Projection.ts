import * as R from "remeda";
import * as path from "path";
import * as AlternatePattern from "./AlternatePattern";

import * as File from "./File";
import * as Result from "../result/Result";
import { pipeAsync } from "../result/asyncPipe";

export interface t {
  [sourcePattern: string]: SourceData;
}

export interface SourceData {
  alternate?: string | string[];
}

export interface ProjectionError {
  message: string;
  startingFile: string;
  alternatesAttempted?: string[];
}

type ProjectionPair = [string, SourceData];
type SingleProjectionPair = [string, { alternate: string }];

const projectionsFilename = ".projections.json";
const starRegex = /\*/;
const basenameRegex = /\{\}|\{basename\}/;

/**
 * Find the path of the alternate file (if the alternate file actually exists)
 * @param userFilePath
 * @return Result.P(alternate file path, list of all attempted alternate files)
 */
export const findAlternateFile = async (
  userFilePath: string
): Result.P<string, ProjectionError> => {
  const result = await findProjectionsFile(userFilePath);

  if (!Result.isOk(result)) {
    return Result.error({
      message: "no result found",
      startingFile: userFilePath
    });
  }

  const projectionsPath = result.ok;
  const normalizedUserFilePath = path.resolve(userFilePath);

  return pipeAsync(
    projectionsPath,
    readProjections,
    Result.mapOk(projectionsToAlternatePatterns),
    Result.asyncChainOk(
      alternatePathIfExists(normalizedUserFilePath, projectionsPath)
    )
  );
};

/**
 * Find the path of the alternate file if the alternate file actually exists, or create the file if it doesn't.
 * @param userFilePath
 * @return Result.P(alternate file path, error if no possible alternate file)
 */
export const findOrCreateAlternateFile = async (
  userFilePath: string
): Result.P<string, string> => {
  return pipeAsync(
    userFilePath,
    findAlternateFile,
    Result.asyncChainError(async (error: ProjectionError) => {
      const alternatesAttempted = error.alternatesAttempted || [];
      if (alternatesAttempted.length === 0) {
        return Result.error(
          `Couldn't create an alternate file for '${userFilePath}': it didn't match any known patterns.`
        );
      }
      return File.makeFile(alternatesAttempted[0]);
    })
  );
};

/**
 * Parse the projections file into alternate pattern lookup objects.
 * @param projections
 */
export const projectionsToAlternatePatterns = (
  projections: t
): AlternatePattern.t[] => {
  const pairs = R.toPairs(projections) as ProjectionPair[];
  const allPairs = R.flatten(pairs.map(splitOutAlternates));

  return allPairs.map(projectionPairToAlternatePattern);
};

export const create = () => {};

const findProjectionsFile = async (userFilePath: string) =>
  File.findFile(projectionsFilename)(userFilePath);

/**
 * Read and parse the projections file.
 * @param userFilePath
 * @returns projections data
 */
const readProjections = async (projectionsPath: string): Result.P<t, any> => {
  return pipeAsync(
    projectionsPath,
    File.readFile,
    Result.mapOk((data: string): string => (data === "" ? "{}" : data)),
    Result.chainOk((x: string) => File.parseJson<t>(x))
  );
};

const splitOutAlternates = (pair: ProjectionPair): SingleProjectionPair[] => {
  const [main, { alternate }] = pair;

  if (Array.isArray(alternate)) {
    return alternate.map(
      foo => [main, { alternate: foo }] as SingleProjectionPair
    );
  }

  if (alternate) {
    return [[main, { alternate }]] as SingleProjectionPair[];
  }

  throw new Error(`${main} is missing the alternate key`);
};

/**
 * Go from alternate patterns to an alternate file path (if the file exists).
 * @param userFilePath - A file path to find an alternate file for.
 * @param patterns - Alternate Patterns from a projections file.
 */
const alternatePathIfExists = (
  userFilePath: string,
  projectionsPath: string
) => async (patterns: AlternatePattern.t[]): Result.P<string, string[]> => {
  return R.pipe(
    patterns,
    R.map(AlternatePattern.alternatePath(userFilePath, projectionsPath)),
    paths => R.compact(paths) as string[],
    File.findExisting
  );
};

const projectionPairToAlternatePattern = ([
  main,
  { alternate }
]: SingleProjectionPair): AlternatePattern.t => ({
  main: mainPathToAlternate(main),
  alternate: alternatePathToAlternate(alternate)
});

const mainPathToAlternate = (path: string): string => {
  if (!starRegex.test(path)) {
    throw new Error(`${path} is an invalid main projection path`);
  }

  const taggedPath = /\*\*/.test(path) ? path : path.replace("*", "**/*");

  return taggedPath.replace("**", "{dirname}").replace("*", "{basename}");
};

const alternatePathToAlternate = (path: string): string => {
  if (!basenameRegex.test(path)) {
    throw new Error(`${path} is an invalid alternate projection path`);
  }

  return path.replace(/\{\}/g, "{dirname}/{basename}");
};
