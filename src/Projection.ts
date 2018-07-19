import * as fs from "fs";
import * as promisify from "util.promisify";
import * as vscode from "vscode";
import * as utils from "./utils";
import * as AlternatePattern from "./AlternatePattern";
import * as FilePath from "./FilePath";

export interface t {
  [sourcePattern: string]: SourceData;
}

export interface SourceData {
  alternate?: string | string[];
  template?: string[];
}

type ProjectionPair = [string, SourceData];
type SingleProjectionPair = [
  string,
  { alternate: string; template?: string[] }
];

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
  const allPairs = utils.flatMap(splitOutAlternates)(pairs);

  return allPairs.map(projectionPairToAlternatePattern);
};

const readFileByUri = async (uri: vscode.Uri): Promise<string> => {
  const data = await readFile(uri.fsPath);
  return data.toString();
};

const readFile: (filename: string) => Promise<Buffer> = promisify(fs.readFile);

const parseProjections: (file: string) => t = JSON.parse;

const splitOutAlternates = (pair: ProjectionPair): SingleProjectionPair[] => {
  const [main, { alternate, template }] = pair;

  if (Array.isArray(alternate)) {
    return alternate.map(
      alternate => [main, { alternate, template }] as SingleProjectionPair
    );
  }

  return [[main, { alternate, template }]] as SingleProjectionPair[];
};

const projectionPairToAlternatePattern = ([
  main,
  { alternate, template }
]: SingleProjectionPair): AlternatePattern.t => ({
  main: mainPathToAlternate(main),
  alternate: alternatePathToAlternate(alternate),
  template: template || []
});

const mainPathToAlternate = (path: string): string => {
  if (!starRegex.test(path)) {
    throw new Error(`${path} is an invalid main projection path`);
  }

  const taggedPath = /\*\*/.test(path) ? path : path.replace("*", "**/*");

  return taggedPath.replace("**", "{dirname}").replace("*", "{basename}");
};

const alternatePathToAlternate = (path: string): string | null => {
  if (!basenameRegex.test(path)) return null;

  return path.replace(/\{\}/g, "{dirname}/{basename}");
};
