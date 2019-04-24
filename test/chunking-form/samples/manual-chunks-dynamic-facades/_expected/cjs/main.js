'use strict';

var dynamic = require('./generated-dynamic.js');

Promise.all([Promise.resolve(require('./generated-dynamic.js')), Promise.resolve(require('./generated-dynamic2.js')), Promise.resolve(require('./generated-dynamic3.js'))]).then(
	results => console.log(results, dynamic.DEP)
);
