'use strict';

new Promise(function (resolve) { resolve(require('./dynamic-included.js')); }).then(result => console.log(result));
