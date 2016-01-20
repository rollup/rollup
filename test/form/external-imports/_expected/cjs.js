'use strict';

function _interopRequire (id) { var ex = require(id); return 'default' in ex ? ex['default'] : ex; }

var factory = _interopRequire('factory');
var baz = require('baz');
var containers = require('shipping-port');
var alphabet = _interopRequire('alphabet');
var alphabet__default = alphabet;

factory( null );
baz.foo( baz.bar, containers.port );
containers.forEach( console.log, console );
console.log( alphabet.a );
console.log( alphabet__default.length );