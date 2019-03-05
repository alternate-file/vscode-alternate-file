import * as R from "remeda";
import * as path from "path";
import * as AlternatePattern from "./AlternatePattern";

import * as File from "./File";
import * as Result from "../result/Result";
import { pipeAsync } from "../result/asyncPipe";
import * as AlternateFileNotFoundError from "./AlternateFileNotFoundError";

/**
 * the data type for a .projections.json file.
 */
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
export const findAlternateFile = async (
  userFilePath: string
): Result.P<string, AlternateFileNotFoundError.t> => {
  const result = await findProjectionsFile(userFilePath);

  if (!Result.isOk(result)) {
    return Result.error({
      message: `No ${projectionsFilename} found as a parent of ${userFilePath}`,
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
): Result.P<string, AlternateFileNotFoundError.t> => {
  return pipeAsync(
    userFilePath,
    findAlternateFile,
    Result.asyncChainError(async (error: AlternateFileNotFoundError.t) => {
      const alternatesAttempted = error.alternatesAttempted || [];
      if (alternatesAttempted.length === 0) {
        return Result.error({
          ...error,
          message: `Couldn't create an alternate file for '${userFilePath}': it didn't match any known patterns.`
        });
      }

      const newAlternateFile = alternatesAttempted[0];

      return Result.either(
        await File.makeFile(newAlternateFile),
        always(Result.ok(newAlternateFile)),
        always(
          Result.error({
            ...error,
            message: `Couldn't create file ${newAlternateFile}`
          })
        )
      );
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

export const findProjectionsFile = async (userFilePath: string) =>
  File.findFile(projectionsFilename)(userFilePath);

/**
 * Read and parse the projections file.
 * @param userFilePath
 * @returns projections data
 */
export const readProjections = async (
  projectionsPath: string
): Result.P<t, AlternateFileNotFoundError.t> => {
  return pipeAsync(
    projectionsPath,
    File.readFile,
    Result.mapOk((data: string): string => (data === "" ? "{}" : data)),
    Result.chainOk((x: string) => File.parseJson<t>(x)),
    Result.mapError((error: string) => ({
      startingFile: projectionsPath,
      message: error
    }))
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
) => (
  patterns: AlternatePattern.t[]
): Result.P<string, AlternateFileNotFoundError.t> => {
  return pipeAsync(
    patterns,
    R.map(AlternatePattern.alternatePath(userFilePath, projectionsPath)),
    paths => R.compact(paths) as string[],
    File.findExisting,
    Result.mapError((alternatesAttempted: string[]) => ({
      alternatesAttempted,
      message: `No alternate found for ${userFilePath}. Tried: ${alternatesAttempted}`,
      startingFile: userFilePath
    }))
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

const always = <T>(x: T) => (): T => x;
