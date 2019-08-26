'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var external1 = require('external1');
var external2 = _interopDefault(require('external2'));

console.log(external1.foo);

module.exports = external2;
