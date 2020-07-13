'use strict';

var unchanged = require('unchanged');
var changedName = require('changed');
var specialCharacter = require('special-character');
var slash = require('with/slash');
var relative_js = require('./relative.js');

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex : { 'default': ex }; }

var changedName__default = _interopDefault(changedName);

console.log(unchanged.foo, changedName__default['default'], specialCharacter.bar, slash.baz, relative_js.quux);
