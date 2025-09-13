'use strict';

var main = require('./main.js');

console.log(main.dep2);
Promise.resolve().then(function () { return require('./generated-dynamic.js'); });
