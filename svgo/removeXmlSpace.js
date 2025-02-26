"use strict"

const { selectAll } = require("css-select")
const xastAdaptor = require("svgo/lib/svgo/css-select-adapter")

const CSS_SELECT_OPTIONS = {
  xmlMode: true,
  adapter: xastAdaptor,
}

const PLUGIN_NAME = "removeXmlSpace"

exports.name = PLUGIN_NAME
exports.type = "perItem"
exports.description = "removes xml:space attribute from all elements"

exports.fn = (ast, _params, _info) => {
  const elementsWithXmlSpace = selectAll(
    `[xml\\:space]`,
    ast,
    CSS_SELECT_OPTIONS
  )

  elementsWithXmlSpace
    .filter((element) => !!element.attributes["xml:space"])
    .every((element) => {
      delete element.attributes["xml:space"]
    })
}
