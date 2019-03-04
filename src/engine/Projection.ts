import * as R from "remeda";
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
export const findAlternatePath = async (
  userFilePath: string
): Result.P<string, string[]> => {
  return pipeAsync(
    userFilePath,
    findProjections,
    Result.mapOk(projectionsToAlternatePatterns),
    Result.asyncChainOk(alternatePathIfExists(userFilePath))
  );
};

/**
 * Find the path of the alternate file if the alternate file actually exists, or create the file if it doesn't.
 * @param userFilePath
 * @return Result.P(alternate file path, error if no possible alternate file)
 */
export const findOrCreateAlternatePath = async (
  userFilePath: string
): Result.P<string, string> => {
  return pipeAsync(
    userFilePath,
    findAlternatePath,
    Result.asyncChainError(async (possiblePaths: string[]) => {
      if (possiblePaths.length === 0) {
        return Result.error(
          `Couldn't create an alternate file for '${userFilePath}': it didn't match any known patterns.`
        );
      }
      return File.makeFile(possiblePaths[0]);
    })
  );
};

/**
 * Fine and parse the projections file.
 * @param userFilePath
 * @returns projections data
 */
export const findProjections = async (
  userFilePath: string
): Result.P<t, any> => {
  return pipeAsync(
    userFilePath,
    File.findFile(projectionsFilename),
    Result.asyncChainOk(File.readFile),
    Result.mapOk((data: string): string => (data === "" ? "{}" : data)),
    Result.chainOk((x: string) => File.parseJson<t>(x))
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
 * @param path - A file path to find an alternate file for.
 * @param patterns - Alternate Patterns from a projections file.
 */
const alternatePathIfExists = (path: string) => async (
  patterns: AlternatePattern.t[]
): Result.P<string, string[]> => {
  return R.pipe(
    patterns,
    R.map(AlternatePattern.alternatePath(path)),
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
