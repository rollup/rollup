'use strict';

var foo = require('external-all');
var bar = require('external-default');
var baz = require('external-default-named');
var quux = require('external-default-namespace');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var foo__default = /*#__PURE__*/_interopDefaultLegacy(foo);
var bar__default = /*#__PURE__*/_interopDefaultLegacy(bar);
var baz__default = /*#__PURE__*/_interopDefaultLegacy(baz);
var quux__default = /*#__PURE__*/_interopDefaultLegacy(quux);

console.log(foo__default['default'], bar__default['default'], baz__default['default'], quux__default['default']);
