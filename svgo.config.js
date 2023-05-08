const removeAttrsIfSameFill = require("./svgo/removeAttrsIfSameFill")

module.exports = {
  plugins: [
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
    {
      ...removeAttrsIfSameFill,
      params: { attrs: "(stroke|fill)" },
    },
  ],
}
