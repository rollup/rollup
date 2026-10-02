'use strict';

const DEP = 'DEP';

Promise.all([Promise.resolve().then(function () { return require('./generated-dynamic.js'); }), Promise.resolve().then(function () { return require('./generated-dynamic2.js'); }), Promise.resolve().then(function () { return require('./generated-dynamic3.js'); })]).then(
	results => console.log(results, DEP)
);

exports.DEP = DEP;
