'use strict';

new Promise(function (resolve) { resolve(require('./generated-dynamic1.js')); }).then(result => console.log(result));
new Promise(function (resolve) { resolve(require('./generated-dynamic.js')); }).then(result => console.log(result));
