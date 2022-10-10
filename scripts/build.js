"use strict";

const glob = require("glob");
const fs = require("fs-extra");
const path = require("path");
const { version } = require("../package.json");
const write = require("./write");

if (!fs.existsSync(".build/svg")) {
  console.error("Requires optimization step to be run first");
  return;
}

const filepaths = glob.sync(".build/svg/*.svg");
const BUILD_PATH = path.join(__dirname, "..", ".build", "src");

const files = write({
  svgs: filepaths.map((filepath) => ({
    path: filepath,
    source: fs.readFileSync(filepath, { encoding: "utf8" }),
  })),
  version,
});

files.forEach((file) => {
  fs.outputFile(path.join(BUILD_PATH, file.filepath), file.source, (err) => {
    console.log(`Wrote: ${file.filepath}`);
    if (err) console.error(err);
  });
});
