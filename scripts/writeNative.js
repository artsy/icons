"use strict"

const path = require("path")
const { transform } = require("@svgr/core")
const { upperFirst, camelCase } = require("lodash")
const { parse } = require("svg-parser")

const getReactNativeSource = ({ componentName, svgSource, width, height }) => {
  return transform.sync(svgSource, {
    native: true,
    expandProps: "end",
    typescript: true,
    svgProps: {
      fill: "{fillColor}",
      viewBox: `0 0 ${width} ${height}`,
      height: "{scaledHeight}",
      width: "{scaledWidth}",
    },
    template: (variables, context) =>
      reactNativeIconTemplate(
        { componentName, variables, width: `${width}`, height: `${height}` },
        context
      ),
  })
}

const reactNativeIconTemplate = (
  { componentName, variables, width, height },
  { tpl }
) => {
  return tpl`
${variables.imports};
import { getScaledDimensions, getStyledIcon, IconProps } from './Icon';
import { get } from "styled-system";
import { useTheme } from "styled-components/native";

interface ${
    componentName + "Props"
  } extends IconProps, Omit<SvgProps, "fill"> {}

const ScaledSvgComponent = ({ fill, ...props }: ${componentName + "Props"}) => {
  const theme = useTheme();
  const { scaledWidth, scaledHeight } = getScaledDimensions(${width}, ${height});
  const fillColor = get(theme, \`colors.\${fill}\`, fill ?? "black);

  return ${variables.jsx};
};

export const ${componentName} = getStyledIcon(ScaledSvgComponent);

${componentName}.defaultProps = {
  fill: "black100"
};

${componentName}.displayName = "${componentName}";
`
}

const getIconSource = () => `
import { PixelRatio } from "react-native"
import { SvgProps } from "react-native-svg"
import styled from "styled-components"
import { SpaceProps, PositionProps, TopProps, RightProps, LeftProps, ColorProps, ResponsiveValue, space, position, top, right, left } from "styled-system"

export interface IconProps extends Omit<SvgProps, "fill">, SpaceProps, PositionProps, TopProps, RightProps, LeftProps, Omit<ColorProps, "color" | "opacity"> { fill?: ResponsiveValue<string> }

export const getScaledDimensions = (width: number, height: number) => {
  if (!width || !height) {
    throw new Error("#getScaledDimensions, Error: 'height' and 'width' are required");
  }

  const fontScale = PixelRatio.getFontScale()
  const scaledWidth = typeof width === "string" ? width : fontScale * width
  const scaledHeight = typeof height === "string" ? height : fontScale * height

  return { scaledWidth, scaledHeight }
}

export const getStyledIcon = (Icon: React.FC) => {
  return styled(Icon)<IconProps>\`
  position: relative;

  \${space};
  \${top};
  \${right};
  \${left};
  \${position};
  \`
}
`

const getAllIconsSource = ({ iconFiles }) => `
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
      `export { ${componentName} } from './${fileName}'`
  )
  .join("\n")}
`

const getIndexSource = () => `
export * from "./allIcons";
`

const writeNative = ({ svgs }) => {
  const iconFiles = svgs.map((svg) => {
    const name = path.basename(svg.path).replace(".svg", "")
    const componentName = `${upperFirst(camelCase(name))}Icon`
    const fileName = componentName

    const [
      {
        properties: { viewBox },
      },
    ] = parse(svg.source).children
    const [_x, _y, width, height] = viewBox
      .split(" ")
      .map((n) => parseInt(n, 10))

    const source = getReactNativeSource({
      componentName,
      svgSource: svg.source,
      width,
      height,
    })

    return {
      filepath: `${fileName}.tsx`,
      source,
      componentName,
      fileName,
      width,
      height,
    }
  })

  return [
    { filepath: "allIcons.ts", source: getAllIconsSource({ iconFiles }) },
    { filepath: "index.ts", source: getIndexSource() },
    { filepath: "Icon.tsx", source: getIconSource() },
    ...iconFiles,
  ]
}

module.exports = writeNative
