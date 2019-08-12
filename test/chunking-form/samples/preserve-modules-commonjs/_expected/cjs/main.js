'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var external = _interopDefault(require('external'));
var commonjs = require('./commonjs.js');

console.log(commonjs.default, external);
