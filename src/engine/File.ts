import * as fs from "fs";
import { promisify } from "util";
import * as findUp from "find-up";
import * as Result from "../Result";
import { pipeAsync } from "./asyncPipe";

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

export const readFile = (path: string): Result.P<string, any> =>
  fsReadFile(path, "utf8") as Result.P<string, any>;

export const parseJson = <T>(data: string): Result.R<T, any> => {
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

const writeFile = Result.resultify(promisify(fs.writeFile));

const always = <T>(x: T) => (...args: any[]) => x;
