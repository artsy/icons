"use strict"

const { selectAll } = require("css-select")
const xastAdaptor = require("svgo/lib/svgo/css-select-adapter")
const removeAttrs = require("svgo/plugins/removeAttrs")

const CSS_SELECT_OPTIONS = {
  xmlMode: true,
  adapter: xastAdaptor,
}

const PLUGIN_NAME = "removeAttrsIfSameFill"
const ENOATTRS = `Warning: The plugin "${PLUGIN_NAME}" requires the "attrs" parameter.
It should have a pattern to remove, otherwise the plugin is a noop.
`

exports.name = PLUGIN_NAME
exports.type = "full"
exports.description =
  "removes specified attributes if all elements have the same fill value"

exports.params = {
  attrs: undefined,
}

exports.fn = (ast, params, info) => {
  if (typeof params.attrs == "undefined") {
    console.warn(ENOATTRS)
    return null
  }

  const attrs = Array.isArray(params.attrs) ? params.attrs : [params.attrs]

  const elementsWithFill = selectAll(`[fill]`, ast, CSS_SELECT_OPTIONS)

  const sameFillValue = elementsWithFill
    .filter(
      element => !["none", "white", "black"].includes(element.attributes.fill)
    )
    .every((element, _, elements) => {
      return element.attributes.fill === elements[0].attributes.fill
    })

  if (!sameFillValue) {
    return
  }

  return removeAttrs.fn(ast, { attrs }, info)
}
