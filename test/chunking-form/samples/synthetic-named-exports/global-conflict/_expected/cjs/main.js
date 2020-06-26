'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var dep = { foo: 'bar' };
// This should log a global variable
console.log(foo);

exports.foo = dep.foo;
