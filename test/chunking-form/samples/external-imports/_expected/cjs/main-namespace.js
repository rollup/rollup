'use strict';

var foo = require('external-all');
var quux = require('external-default-namespace');
var quux$1 = require('external-named-namespace');
var bar = require('external-namespace');

console.log(foo, bar, quux, quux$1);
