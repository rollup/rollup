'use strict';

new Promise(function (resolve) { resolve(require('./generated-dynamic.js')); }).then(({ value }) => console.log(value));
