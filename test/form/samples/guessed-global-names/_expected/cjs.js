'use strict';

var unchanged = require('unchanged');
var changedName = require('changed');
var specialCharacter = require('special-character');
var slash = require('with/slash');
var relative_js = require('./relative.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var changedName__default = /*#__PURE__*/_interopDefaultLegacy(changedName);

console.log(unchanged.foo, changedName__default["default"], specialCharacter.bar, slash.baz, relative_js.quux);
