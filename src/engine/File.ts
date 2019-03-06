import * as fs from "fs";
import * as findUp from "find-up";
import * as R from "remeda";
import { promisify } from "util";

import {
  error,
  firstOk,
  mapError,
  mapOk,
  ok,
  pipeAsync,
  replaceError,
  replaceOk,
  resultify,
  Result,
  ResultP
} from "result-async";

export type t = string;

/**
 * Find a file by recursively walking up the directory chain.
 * @param fileName - The filename to look for.
 * @param fromFilePath - The file to start looking from
 * @return the full path/"not found"
 */
export const findFile = (fileName: string) => async (
  fromFilePath: string
): ResultP<string, string> => {
  const filePath = await findUp(fileName, { cwd: fromFilePath });

  return filePath === null ? error("file not found") : ok(filePath);
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
): ResultP<string, string> => {
  return pipeAsync(
    path,
    path => writeFile(path, contents, { flag: "wx" }),
    mapOk(always(path)),
    mapError(always(`${path} already exists`))
  );
};

/**
 * Delete a file by path
 * @param filePath
 * @returns ResultP<the deleted file, an error message>
 */
export const deleteFile = (filePath: string): ResultP<string, string> => {
  return pipeAsync(
    filePath,
    unlink,
    replaceOk(filePath),
    replaceError(`can't delete ${filePath}`)
  );
};

/**
 * Check if any of the provided files exists.
 * @param filePaths
 * @returns Ok(filePath) | Error(null)
 */
export const findExisting = async (filePaths: t[]): ResultP<t, string[]> => {
  return pipeAsync(
    filePaths,
    R.map(fileExists),
    files => Promise.all(files),
    file => firstOk(file),
    mapError(always(filePaths))
  );
};

/**
 * Read the contents of a file.
 */
export const readFile = (path: string): ResultP<string, any> =>
  fsReadFile(path, "utf8") as ResultP<string, any>;

/**
 * Wrap a JSON parse in a
 * @returns Ok(body)
 */
export const parseJson = <T>(
  data: string,
  fileName?: string
): Result<T, string> => {
  try {
    return ok(JSON.parse(data));
  } catch (e) {
    const message = `Couldn't parse ${fileName || "file"}: ${e.message}`;
    return error(message);
  }
};

/**
 * Read a file's contents
 * @returns a ResultP<file contents, error>
 */
export const fsReadFile = resultify(promisify(fs.readFile));

const fileExists = async (filePath: t): ResultP<t, null> => {
  return pipeAsync(
    filePath,
    (filePath: string) => access(filePath, fs.constants.R_OK),
    mapOk(always(filePath)),
    mapError(always(null))
  );
};

const writeFile = resultify(promisify(fs.writeFile));
const access = resultify(promisify(fs.access));
const unlink = resultify(promisify(fs.unlink));

const always = <T>(x: T) => (...args: any[]) => x;
