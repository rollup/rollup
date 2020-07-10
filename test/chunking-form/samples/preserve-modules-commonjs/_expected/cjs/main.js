'use strict';

var external = require('external');
var commonjs = require('./commonjs.js');

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

external = _interopDefault(external);

console.log(commonjs, external);
