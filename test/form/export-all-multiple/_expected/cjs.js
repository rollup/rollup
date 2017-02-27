'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var foo = require('foo');
var bar = require('bar');
var baz = require('baz');



Object.keys(foo).forEach(function (key) { exports[key] = foo[key]; });
Object.keys(bar).forEach(function (key) { exports[key] = bar[key]; });
Object.keys(baz).forEach(function (key) { exports[key] = baz[key]; });
