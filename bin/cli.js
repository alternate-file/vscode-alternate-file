#!/usr/bin/env node

/* tslint:disable:variable-name */

const Projection = require("../out/engine/Projections");
const { either } = require("result-async");
const { log } = require("../out/engine/utils");

const main = async () => {
  const fromFile = process.argv[2];

  const result = await Projection.findAlternateFile(fromFile);

  either(result, console.log, error => console.error(error.message));
};

main();
