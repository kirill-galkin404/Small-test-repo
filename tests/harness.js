"use strict";
// Loads counter.js as a classic script in a vm context with a stub document.
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function load() {
  const elements = {};
  function element(id) {
    if (!elements[id]) {
      elements[id] = { id: id, innerHTML: "", style: {}, listeners: {} };
      elements[id].addEventListener = function (type, fn) {
        this.listeners[type] = (this.listeners[type] || []).concat(fn);
      };
    }
    return elements[id];
  }
  const logs = { log: [], warn: [] };
  const context = vm.createContext({
    document: { getElementById: element },
    console: {
      log: function () { logs.log.push([].slice.call(arguments)); },
      warn: function () { logs.warn.push([].slice.call(arguments)); },
    },
  });
  const file = path.join(__dirname, "..", "counter.js");
  vm.runInContext(fs.readFileSync(file, "utf8"), context, { filename: file });

  return {
    elements: elements,
    el: element,
    logs: logs,
    click: function (action) {
      const handlers = element("counter").listeners.click || [];
      handlers.forEach(function (h) { h({ target: { dataset: { action: action } } }); });
    },
    // click on an element without a data-action
    clickPlain: function () {
      const handlers = element("counter").listeners.click || [];
      handlers.forEach(function (h) { h({ target: { dataset: {} } }); });
    },
    dispatch: function (x) { context.__x = x; return vm.runInContext("dispatch(__x)", context); },
    set: function (v) { vm.runInContext("c = " + Number(v), context); },
    value: function () { return vm.runInContext("c", context); },
    clicks: function () { return vm.runInContext("cc", context); },
    ACTION: function () { return vm.runInContext("ACTION", context); },
    listenerCount: function () { return (element("counter").listeners.click || []).length; },
  };
}

module.exports = { load: load };
