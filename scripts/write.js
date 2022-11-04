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

const getReactSource = ({ componentName, svgSource, width, height }) => {
  const svgAsJsx = transform.sync(svgSource, {
    expandProps: false,
    svgProps: { style: `{svgStyle}`, fill: "currentColor" },
    template: ({ jsx }) => jsx,
  });

  return `
import * as React from "react";
import { Box, BoxProps } from "./Box";

const ${componentName} = (props: BoxProps) => {
  const svgStyle: React.CSSProperties = {...${JSON.stringify(SVG_STYLE)}};
  return (
    <Box position="relative" width={${width}} height={${height}} {...props}>${svgAsJsx}</Box>
  );
};

${componentName}.displayName = '${componentName}';

export default ${componentName};
`;
};

const getBoxSource = () => `
import styled from "styled-components";
import { FlexboxProps, LayoutProps, PositionProps, SpaceProps, ColorProps, flexbox, layout, position, space, color, ResponsiveValue, style } from "styled-system";

const fill = style({ prop: "fill", cssProperty: "color", key: "colors" });
interface FillProps { fill?: ResponsiveValue<string>; }

export interface BoxProps extends FlexboxProps, LayoutProps, PositionProps, SpaceProps, Omit<ColorProps, "color">, FillProps {};
export const Box = styled.div<BoxProps>(flexbox, layout, position, space, color, fill);
`;

const getIndexSource = ({ iconFiles }) => `
console.warn("For internal use only. Import from the individual files rather than from the index.");
export const ICONS = ${JSON.stringify(
  iconFiles.map(({ fileName, componentName, width, height }) => ({
    fileName,
    componentName,
    width,
    height,
  }))
)};

${iconFiles
  .map(
    ({ fileName, componentName }) =>
      `export { default as ${componentName} } from './${fileName}';`
  )
  .join("\n")}
`;

const write = ({ svgs }) => {
  const iconFiles = svgs.map((svg) => {
    const name = path.basename(svg.path).replace(".svg", "");
    const componentName = `${upperFirst(camelCase(name))}Icon`;
    const fileName = componentName;

    const [
      {
        properties: { viewBox },
      },
    ] = parse(svg.source).children;
    const [_x, _y, width, height] = viewBox
      .split(" ")
      .map((n) => parseInt(n, 10));

    const source = getReactSource({
      componentName,
      svgSource: svg.source,
      width,
      height,
    });

    return {
      filepath: `${fileName}.tsx`,
      source,
      componentName,
      fileName,
      width,
      height,
    };
  });

  return [
    { filepath: "allIcons.ts", source: getIndexSource({ iconFiles }) },
    { filepath: "Box.tsx", source: getBoxSource() },
    ...iconFiles,
  ];
};

module.exports = write;
