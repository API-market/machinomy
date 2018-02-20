"use strict";
exports.__esModule = true;
var debug = require("debug");
function log(namespace) {
    return debug("machinomy:" + namespace);
}
exports["default"] = log;
