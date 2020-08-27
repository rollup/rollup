'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var _default = require('./default.js');
var named = require('./named.js');

console.log(_default['default'], named.value);

Promise.resolve().then(function () { return require('./default.js'); }).then(result => console.log(result.default));
Promise.resolve().then(function () { return require('./named.js'); }).then(result => console.log(result.value));

exports.default = _default['default'];
