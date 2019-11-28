'use strict';

var _default = require('./default.js');
var named = require('./named.js');

console.log(_default, named.value);

new Promise(function (resolve) { resolve({ 'default': require('./default.js') }); }).then(result => console.log(result.default));
new Promise(function (resolve) { resolve(require('./named.js')); }).then(result => console.log(result.value));

module.exports = _default;
