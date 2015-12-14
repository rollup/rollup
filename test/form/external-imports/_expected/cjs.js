'use strict';

var factory = require('factory');
factory = 'default' in factory ? factory['default'] : factory;
var baz = require('baz');
var containers = require('shipping-port');
var alphabet = require('alphabet');
var alphabet__default = 'default' in alphabet ? alphabet['default'] : alphabet;

factory( null );
baz.foo( baz.bar, containers.port );
containers.forEach( console.log, console );
console.log( alphabet.a );
console.log( alphabet__default.length );
