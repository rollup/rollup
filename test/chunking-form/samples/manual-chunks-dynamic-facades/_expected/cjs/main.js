'use strict';

var dynamic = require('./generated-dynamic.js');

Promise.all([new Promise(function (resolve) { resolve(require('./generated-dynamic.js')); }).then(function (n) { return n.dynamic1; }), new Promise(function (resolve) { resolve(require('./generated-dynamic.js')); }).then(function (n) { return n.dynamic2; }), new Promise(function (resolve) { resolve(require('./generated-dynamic.js')); }).then(function (n) { return n.dynamic3; })]).then(
	results => console.log(results, dynamic.DEP)
);
