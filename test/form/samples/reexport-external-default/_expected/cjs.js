'use strict';

var external1 = require('external1');
var external2 = require('external2');

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

external2 = _interopDefault(external2);

console.log(external1.foo);

module.exports = external2;
