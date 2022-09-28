module.exports = {
  plugins: [
    "removeDimensions",
    "removeViewBox",
    "removeXMLNS",
    "removeTitle",
    { name: "removeAttrs", params: { attrs: "(stroke|fill)" } },
  ],
};
