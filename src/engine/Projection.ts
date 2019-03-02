import * as fs from "fs";
import { promisify } from "util";
import * as vscode from "vscode";
import * as R from "remeda";
import * as AlternatePattern from "./AlternatePattern";
import * as FilePath from "./FilePath";

import * as File from "./File";
import * as Result from "../Result";
import { pipeAsync } from "./asyncPipe";

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

export const projectionsToAlternatePatterns = (
  projections: t
): AlternatePattern.t[] => {
  const pairs = R.toPairs(projections) as ProjectionPair[];
  const allPairs = R.unnest(pairs.map(splitOutAlternates));

  return allPairs.map(projectionPairToAlternatePattern);
};

const readFileByUri = async (uri: vscode.Uri): Promise<string> => {
  const data = await readFile(uri.fsPath);
  return data.toString();
};

export const create = () => {};

const readFile: (filename: string) => Promise<Buffer> = promisify(fs.readFile);

const parseProjections: (file: string) => t = JSON.parse;

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
