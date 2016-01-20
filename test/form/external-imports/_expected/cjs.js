'use strict';

function _interopDefault (ex) { return 'default' in ex ? ex['default'] : ex; }

var factory = _interopDefault(require('factory'));
var baz = require('baz');
var containers = require('shipping-port');
var alphabet = require('alphabet');
var alphabet__default = _interopDefault(alphabet);

factory( null );
baz.foo( baz.bar, containers.port );
containers.forEach( console.log, console );
console.log( alphabet.a );
console.log( alphabet__default.length );