'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var foo = require('./entry-foo-cjs-ts.ts.js');
var bar = require('./nested/entry-bar-cjs-ts.ts.js');
var baz = require('./nested/entry-baz-cjs-ts.ts.js');
var lorem = require('./entry-lorem-cjs-str.str.str.js');
var noExt = require('./entry-no-ext-cjs-.js');



exports.foo = foo;
exports.bar = bar;
exports.baz = baz;
exports.lorem = lorem;
exports.noExt = noExt;
