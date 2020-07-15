'use strict';

var factory = require('factory');
var baz = require('baz');
var containers = require('shipping-port');
var alphabet = require('alphabet');

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex : { 'default': ex }; }

var factory__default = /*#__PURE__*/_interopDefault(factory);
var alphabet__default = /*#__PURE__*/_interopDefault(alphabet);

factory__default['default']( null );
baz.foo( baz.bar, containers.port );
containers.forEach( console.log, console );
console.log( alphabet.a );
console.log( alphabet__default['default'].length );
