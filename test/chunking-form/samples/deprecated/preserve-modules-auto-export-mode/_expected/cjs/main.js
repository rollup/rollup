'use strict';

var _default = require('./default.js');
var named = require('./named.js');

console.log(_default, named.value);

Promise.resolve().then(function () { return { 'default': require('./default.js') }; }).then(result => console.log(result.default));
Promise.resolve().then(function () { return require('./named.js'); }).then(result => console.log(result.value));

module.exports = _default;
