import * as fs from "fs";
import * as promiseify from "util.promisify";
import * as vscode from "vscode";
import * as utils from "./utils";
import * as AlternatePattern from "./AlternatePattern";
import * as FilePath from "./FilePath";

export interface t {
  [sourcePattern: string]: SourceData;
}

interface SourceData {
  alternate: string;
}
type ProjectionPair = [string, SourceData];

const projectionsFilename = ".projections.json";
const starRegex = /\*/;
const basenameRegex = /\{\}|\{basename\}/;

export const findProjections = (): Thenable<t> =>
  FilePath.findFileUri(projectionsFilename)
    .then(readFileByUri)
    .then(parseProjections);

export const projectionsToAlternatePatterns = (
  projections: t
): AlternatePattern.t[] => {
  const pairs = utils.toPairs(projections) as [string, SourceData][];
  return pairs.map(projectionPairToAlternatePattern);
};

const readFileByUri = async (uri: vscode.Uri): Promise<string> => {
  const data = await readFile(uri.fsPath);
  return data.toString();
};

const readFile: (filename: string) => Promise<Buffer> = promiseify(fs.readFile);

const parseProjections: (file: string) => t = JSON.parse;

const projectionPairToAlternatePattern = ([
  main,
  { alternate }
]: ProjectionPair): AlternatePattern.t => ({
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
