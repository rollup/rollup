'use strict';

new Promise(function (resolve) { resolve(require('./generated-dynamic1.js')); }).then(result => console.log(result));
new Promise(function (resolve) { resolve(require('./generated-dynamic2.js')); }).then(result => console.log(result));
