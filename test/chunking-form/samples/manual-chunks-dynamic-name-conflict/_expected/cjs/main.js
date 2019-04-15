'use strict';

Promise.resolve(require('./generated-chunk.js')).then(result => console.log(result));
Promise.resolve(require('./generated-dynamic.js')).then(result => console.log(result));
