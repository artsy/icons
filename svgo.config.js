const removeAttrsIfSameFill = require("./svgo/removeAttrsIfSameFill")
const removeXmlSpace = require("./svgo/removeXmlSpace")

module.exports = {
  plugins: [
    removeXmlSpace,
    "removeDimensions",
    "removeViewBox",
    "removeXMLNS",
    "removeTitle",
    "collapseGroups",
    "removeUselessDefs",
    "inlineStyles",
    "removeComments",
    "removeUnknownsAndDefaults",
    "cleanupIds",
    "convertStyleToAttrs",
    "cleanupEnableBackground",
    {
      ...removeAttrsIfSameFill,
      params: { attrs: "(stroke|fill)" },
    },
  ],
}
