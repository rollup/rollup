'use strict';

var path = require('external');

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

path = _interopDefault(path);

console.log(path.normalize('foo\\bar'));
console.log(path.normalize('foo\\bar'));
