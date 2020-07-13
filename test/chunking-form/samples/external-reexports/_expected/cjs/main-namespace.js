'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var externalAll = require('external-all');
var externalDefaultNamespace = require('external-default-namespace');
var externalNamedNamespace = require('external-named-namespace');
var externalNamespace$1 = require('external-namespace');

const externalNamespace = 42;
console.log(externalNamespace);

exports.foo = externalAll;
exports.baz = externalDefaultNamespace;
exports.quux = externalNamedNamespace;
exports.bar = externalNamespace$1;
