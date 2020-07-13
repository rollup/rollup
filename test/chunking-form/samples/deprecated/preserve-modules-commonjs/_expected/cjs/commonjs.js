'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var external = require('external');
var other = require('./other.js');

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex : { 'default': ex }; }

var external__default = _interopDefault(external);

const { value } = other.default;

console.log(external__default['default'], value);

var commonjs = 42;

module.exports = commonjs;
