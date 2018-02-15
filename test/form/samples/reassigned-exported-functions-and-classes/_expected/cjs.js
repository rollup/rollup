'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function foo () {}
foo = 1;

var bar = 1;
function bar () {}

function baz () {}
var baz = 1;

class quux {}
quux = 1;

exports.foo = foo;
exports.bar = bar;
exports.baz = baz;
exports.quux = quux;
