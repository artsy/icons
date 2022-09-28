"use strict";

const path = require("path");
const { transform } = require("@svgr/core");
const { upperFirst, camelCase } = require("lodash");
const { parse } = require("svg-parser");

const SVG_STYLE = {
  position: "absolute",
  top: "0",
  right: "0",
  bottom: "0",
  left: "0",
  width: "100%",
  height: "100%",
};

const getReactSource = ({ componentName, svgSource }) => {
  const svgAsJsx = transform.sync(svgSource, {
    expandProps: false,
    svgProps: { style: `{svgStyle}`, fill: "currentColor" },
    template: ({ jsx }) => jsx,
  });

  const [
    {
      properties: { viewBox },
    },
  ] = parse(svgSource).children;

  const [_, __, width, height] = viewBox.split(" ").map((n) => parseInt(n, 10));

  return `
import * as React from "react";
import { Box } from "@artsy/palette";

const ${componentName} = (props) => {
  const svgStyle: React.CSSProperties = {...${JSON.stringify(SVG_STYLE)}};
  return (
    <Box position="relative" width={${width}} height={${height}} {...props}>${svgAsJsx}</Box>
  );
};

${componentName}.displayName = '${componentName}';

export default ${componentName};
  `;
};

const getPackageJsonSource = ({ version }) => `{
  "name": "@artsy/icons",
  "version": "${version}",
  "peerDependencies": {
    "react": ">=16.2.0",
    "@artsy/palette": ">=24.0.0"
  },
  "main": "index.js",
  "types": "index.d.ts",
  "publishConfig": {
    "access": "public",
    "registry": "https://registry.npmjs.org"
  }
}`;

const getIndexSource = ({ iconFiles }) => `
console.warn("For internal use only. Import from the individual files rather than from the index.");
export const ICONS = ${JSON.stringify(
  iconFiles.map(({ fileName, componentName }) => ({ fileName, componentName }))
)};

${iconFiles
  .map(
    ({ fileName, componentName }) =>
      `export { default as ${componentName} } from './${fileName}';`
  )
  .join("\n")}
`;

const write = ({ svgs, version }) => {
  const iconFiles = svgs.map((svg) => {
    const name = path.basename(svg.path).replace(".svg", "");
    const componentName = `${upperFirst(camelCase(name))}Icon`;
    const fileName = componentName;
    const source = getReactSource({ componentName, svgSource: svg.source });

    return { filepath: `${fileName}.tsx`, source, componentName, fileName };
  });

  return [
    { filepath: "package.json", source: getPackageJsonSource({ version }) },
    { filepath: "index.ts", source: getIndexSource({ iconFiles }) },
    ...iconFiles,
  ];
};

module.exports = write;
