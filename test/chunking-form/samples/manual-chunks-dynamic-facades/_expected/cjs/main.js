'use strict';

var dep = require('./generated-dep.js');

Promise.all([Promise.resolve().then(function () { return require('./generated-dynamic.js'); }), Promise.resolve().then(function () { return require('./generated-dynamic2.js'); }), Promise.resolve().then(function () { return require('./generated-dynamic3.js'); })]).then(
	results => console.log(results, dep.DEP)
);
