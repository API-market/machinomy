"use strict";
exports.__esModule = true;
function namespaced(namespace, kind) {
    var result = kind;
    if (namespace) {
        result = namespace + ':' + kind;
    }
    return result;
}
exports.namespaced = namespaced;
