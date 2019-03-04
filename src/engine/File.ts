import * as fs from "fs";
import * as findUp from "find-up";
import * as R from "remeda";
import { promisify } from "util";

import * as Result from "../result/Result";
import { pipeAsync } from "../result/asyncPipe";

export type t = string;

/**
 * Find a file by recursively walking up the directory chain.
 * @param fileName - The filename to look for.
 * @param fromFilePath - The file to start looking from
 * @return the full path/"not found"
 */
export const findFile = (fileName: string) => async (
  fromFilePath: string
): Result.P<string, string> => {
  const path = await findUp(fileName, { cwd: fromFilePath });

  return path === null ? Result.error("not found") : Result.ok(path);
};

/**
 * Create a new file, with contents.
 * @param path
 * @param contents
 * @returns filePath
 */
export const makeFile = async (
  path: string,
  contents: string = ""
): Result.P<string, string> => {
  return pipeAsync(
    path,
    path => writeFile(path, contents, { flag: "wx" }),
    Result.mapOk(always(path)),
    Result.mapError(always(`${path} already exists`))
  );
};

/**
 * Check if any of the provided files exists.
 * @param filePaths
 * @returns Ok(filePath) | Error(null)
 */
export const findExisting = async (filePaths: t[]): Result.P<t, string[]> => {
  return pipeAsync(
    filePaths,
    R.map(fileExists),
    files => Promise.all(files),
    file => Result.firstOk(file),
    Result.mapError(always(filePaths))
  );
};

/**
 * Read the contents of a file.
 */
export const readFile = (path: string): Result.P<string, any> =>
  fsReadFile(path, "utf8") as Result.P<string, any>;

/**
 * Wrap a JSON parse in a Result.
 * @returns Ok(body)
 */
export const parseJson = <T>(data: string): Result.Result<T, any> => {
  try {
    return Result.ok(JSON.parse(data));
  } catch (e) {
    return Result.error(e);
  }
};

/**
 * Read a file's contents
 * @returns a Result.P<file contents, error>
 */
export const fsReadFile = Result.resultify(promisify(fs.readFile));

const fileExists = async (filePath: t): Result.P<t, null> => {
  return pipeAsync(
    filePath,
    (filePath: string) => access(filePath, fs.constants.R_OK),
    Result.mapOk(always(filePath)),
    Result.mapError(always(null))
  );
};

const writeFile = Result.resultify(promisify(fs.writeFile));
const access = Result.resultify(promisify(fs.access));

const always = <T>(x: T) => (...args: any[]) => x;
