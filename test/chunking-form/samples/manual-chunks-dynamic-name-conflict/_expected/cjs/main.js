'use strict';

new Promise(function (resolve) { resolve(require('./generated-dynamic.js')); }).then(function (n) { return n.dynamic1; }).then(result => console.log(result));
new Promise(function (resolve) { resolve(require('./generated-dynamic.js')); }).then(function (n) { return n.dynamic2; }).then(result => console.log(result));
