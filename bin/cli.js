#!/usr/bin/env node

/* tslint:disable:variable-name */

const Projection = require("../out/engine/Projections");
const Result = require("../out/result/Result");
const { log } = require("../out/engine/utils");

const main = async () => {
  const fromFile = process.argv[2];

  const result = await Projection.findAlternateFile(fromFile);

  Result.either(result, console.log, error => console.error(error.message));
};

main();
