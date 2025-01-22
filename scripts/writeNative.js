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
      fill: "{props.fill}",
      viewBox: `0 0 ${height} ${width}`,
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
import {getScaledDimensions, getStyledIcon, IconProps, DEFAULT_SIZE} from './Icon';

interface ${componentName + "Props"} extends IconProps, SvgProps {
  fill?: string;
}

const ScaledSvgComponent = (props: ${componentName + "Props"}) => {
  const { scaledHeight, scaledWidth } = getScaledDimensions(${height}, ${width});

  return ${variables.jsx};
};

const ${componentName} = getStyledIcon(ScaledSvgComponent);

${componentName}.defaultProps = {
  fill: "black",
  width: DEFAULT_SIZE,
  height: DEFAULT_SIZE,
};

${componentName}.displayName = "${componentName}";

export default ${componentName};
`
}

const getIconSource = () => `
import { PixelRatio } from "react-native"
import { SvgProps } from "react-native-svg"
import styled from "styled-components"
import { left, LeftProps, position, PositionProps, right, RightProps, space, SpaceProps, top, TopProps } from "styled-system"

export const DEFAULT_SIZE = 18

export interface IconProps extends SvgProps, SpaceProps, PositionProps, TopProps, RightProps, LeftProps { fill?: string }

export const getScaledDimensions = (width = DEFAULT_SIZE, height = DEFAULT_SIZE) => {
  const fontScale = PixelRatio.getFontScale()
  const scaledWidth = typeof width === "string" ? width : fontScale * width
  const scaledHeight = typeof height === "string" ? height : fontScale * height

  return { scaledHeight, scaledWidth }
}

export const getStyledIcon = (Icon: React.FC) => {
  return styled(Icon)<IconProps>({position: "relative"}, space, top, right, left, position)
}
`

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
      `export { default as ${componentName} } from './${fileName}'`
  )
  .join("\n")}
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
    { filepath: "allIcons.ts", source: getIndexSource({ iconFiles }) },
    { filepath: "Icon.tsx", source: getIconSource() },
    ...iconFiles,
  ]
}

module.exports = writeNative
