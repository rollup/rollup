'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var myExternal = _interopDefault(require('external'));

const test = () => myExternal;

const someDynamicImport = () => Promise.resolve(require('external'));

exports.test = test;
exports.someDynamicImport = someDynamicImport;
