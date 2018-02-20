"use strict";
exports.__esModule = true;
/* tslint:disable */
function container() {
    if (typeof global !== 'undefined') {
        return global;
    }
    else if (typeof window !== 'undefined') {
        return window;
    }
    else if (typeof process !== 'undefined' && typeof process.env === 'object') {
        return process.env;
    }
    else {
        return {};
    }
}
exports.container = container;
/* tslint:enable */
