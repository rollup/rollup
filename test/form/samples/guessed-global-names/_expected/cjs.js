'use strict';

var unchanged = require('unchanged');
var changedName = require('changed');
var specialCharacter = require('special-character');
var slash = require('with/slash');
var relative_js = require('./relative.js');

console.log(unchanged.foo, changedName, specialCharacter.bar, slash.baz, relative_js.quux);
