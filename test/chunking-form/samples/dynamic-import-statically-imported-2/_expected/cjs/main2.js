'use strict';

new Promise(function (resolve) { resolve(require('./generated-dep12.js')); }).then(({ bar }) => console.log(bar()));
