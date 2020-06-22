'use strict';

var dynamic = require('./generated-dynamic.js');

Promise.all([Promise.resolve().then(function () { return require('./generated-dynamic.js'); }).then(function (n) { return n.dynamic1; }), Promise.resolve().then(function () { return require('./generated-dynamic.js'); }).then(function (n) { return n.dynamic2; }), Promise.resolve().then(function () { return require('./generated-dynamic.js'); }).then(function (n) { return n.dynamic3; })]).then(
	results => console.log(results, dynamic.DEP)
);
