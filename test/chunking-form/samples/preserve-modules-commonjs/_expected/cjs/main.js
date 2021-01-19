'use strict';

var commonjs = require('./commonjs.js');
var external = require('external');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var external__default = /*#__PURE__*/_interopDefaultLegacy(external);

console.log(commonjs, external__default['default']);
