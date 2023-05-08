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
    {
      ...removeAttrsIfSameFill,
      params: { attrs: "(stroke|fill)" },
    },
  ],
}
