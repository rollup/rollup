'use strict';

var dynamic = require('./generated-dynamic.js');

Promise.all([Promise.resolve(require('./generated-dynamic.js')), Promise.resolve(require('./generated-chunk.js')), Promise.resolve(require('./generated-chunk2.js'))]).then(
	results => console.log(results, dynamic.DEP)
);
