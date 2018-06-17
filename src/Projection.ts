import * as fs from "fs";
import * as promiseify from "util.promisify";
import * as vscode from "vscode";
import * as utils from "./utils";
import * as AlternatePattern from "./AlternatePattern";
import * as FilePath from "./FilePath";

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

export const findProjections = async (): Promise<t> => {
  const uri = await FilePath.findFileUri(projectionsFilename);
  const fileData = await readFileByUri(uri);

  // Handle blank files, so creation doesn't throw an error.
  if (!fileData) return {};

  return parseProjections(fileData);
};

export const projectionsToAlternatePatterns = (
  projections: t
): AlternatePattern.t[] => {
  const pairs = utils.toPairs(projections) as ProjectionPair[];
  const allPairs = utils.flatten(pairs.map(splitOutAlternates));

  return allPairs.map(projectionPairToAlternatePattern);
};

const readFileByUri = async (uri: vscode.Uri): Promise<string> => {
  const data = await readFile(uri.fsPath);
  return data.toString();
};

const readFile: (filename: string) => Promise<Buffer> = promiseify(fs.readFile);

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
