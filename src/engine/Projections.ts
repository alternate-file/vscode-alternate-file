import * as R from "remeda";
import * as path from "path";
import * as AlternatePattern from "./AlternatePattern";

import * as File from "./File";
import {
  pipeAsync,
  asyncChainOk,
  ResultP,
  isOk,
  chainOk,
  mapError,
  ok,
  error,
  either,
  mapOk,
  asyncChainError
} from "result-async";
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
 * @return ResultP(alternate file path, list of all attempted alternate files)
 */
export const findAlternateFile = async (
  userFilePath: string
): ResultP<string, AlternateFileNotFoundError.t> => {
  const result = await findProjectionsFile(userFilePath);

  if (!isOk(result)) {
    return error({
      message: `No ${projectionsFilename} found as a parent of ${userFilePath}`,
      startingFile: userFilePath
    });
  }

  const projectionsPath = result.ok;
  const normalizedUserFilePath = path.resolve(userFilePath);

  return pipeAsync(
    projectionsPath,
    readProjections,
    mapOk(projectionsToAlternatePatterns),
    asyncChainOk(alternatePathIfExists(normalizedUserFilePath, projectionsPath))
  );
};

/**
 * Find the path of the alternate file if the alternate file actually exists, or create the file if it doesn't.
 * @param userFilePath
 * @return ResultP(alternate file path, error if no possible alternate file)
 *
 */
export const findOrCreateAlternateFile = async (
  userFilePath: string
): ResultP<string, AlternateFileNotFoundError.t> => {
  return pipeAsync(
    userFilePath,
    findAlternateFile,
    asyncChainError(async (err: AlternateFileNotFoundError.t) => {
      const alternatesAttempted = err.alternatesAttempted || [];
      if (alternatesAttempted.length === 0) {
        return error({
          ...err,
          message: `Couldn't create an alternate file for '${userFilePath}': it didn't match any known patterns.`
        });
      }

      const newAlternateFile = alternatesAttempted[0];

      return either(
        await File.makeFile(newAlternateFile),
        always(ok(newAlternateFile)),
        always(
          error({
            ...err,
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
): ResultP<t, AlternateFileNotFoundError.t> => {
  return pipeAsync(
    projectionsPath,
    File.readFile,
    mapOk((data: string): string => (data === "" ? "{}" : data)),
    chainOk((x: string) => File.parseJson<t>(x, projectionsPath)),
    mapError((err: string) => ({
      startingFile: projectionsPath,
      message: err
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
): ResultP<string, AlternateFileNotFoundError.t> => {
  return pipeAsync(
    patterns,
    R.map(AlternatePattern.alternatePath(userFilePath, projectionsPath)),
    paths => R.compact(paths) as string[],
    File.findExisting,
    mapError((alternatesAttempted: string[]) => ({
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

  return taggedPath.replace(/\*\*/g, "{dirname}").replace("*", "{basename}");
};

const alternatePathToAlternate = (path: string): string => {
  if (!basenameRegex.test(path)) {
    throw new Error(`${path} is an invalid alternate projection path`);
  }

  return path.replace(/\{\}/g, "{dirname}/{basename}");
};

const always = <T>(x: T) => (): T => x;
