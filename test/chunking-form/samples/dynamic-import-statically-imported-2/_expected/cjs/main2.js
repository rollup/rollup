'use strict';

new Promise(function (resolve) { resolve(require('./generated-dep1.js')); }).then(function (n) { return n.dep1; }).then(({ bar }) => console.log(bar()));
