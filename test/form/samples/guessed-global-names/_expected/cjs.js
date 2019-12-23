'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var unchanged = require('unchanged');
var changedName = _interopDefault(require('changed'));
var specialCharacter = require('special-character');
var slash = require('with/slash');
var relative_js = require('./relative.js');

console.log(unchanged.foo, changedName, specialCharacter.bar, slash.baz, relative_js.quux);
