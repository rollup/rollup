'use strict';

var external = require('external');
var other = require('./other.js');

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

external = _interopDefault(external);

const { value } = other.default;

console.log(external, value);

var commonjs = 42;

module.exports = commonjs;
