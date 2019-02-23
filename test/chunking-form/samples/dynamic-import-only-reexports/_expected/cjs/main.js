'use strict';

Promise.resolve(require('./generated-chunk.js')).then(({ value }) => console.log(value));
