'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var index = require('./sub/index.js');

const baz = { bar: index["default"] };

exports.foo = index.foo;
exports.baz = baz;
