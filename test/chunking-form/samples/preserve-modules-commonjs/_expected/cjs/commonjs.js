'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var external = _interopDefault(require('external'));
var other = require('./other.js');

const { value } = other.default;

console.log(external, value);

var commonjs = 42;

exports.__moduleExports = commonjs;
exports.default = commonjs;
