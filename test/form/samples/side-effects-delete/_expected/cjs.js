'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var x = {foo: 'bar'};
delete x.foo;

delete globalThis.unknown.foo;

exports.x = x;
