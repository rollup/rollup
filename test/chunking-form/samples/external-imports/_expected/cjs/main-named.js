'use strict';

var foo = require('external-all');
var externalNamed = require('external-named');
var baz = require('external-default-named');
var quux = require('external-named-namespace');

console.log(foo.foo, externalNamed.bar, baz.baz, quux.quux);
