'use strict';

Promise.resolve(require('./generated-dynamic.js')).then(({ value }) => console.log(value));
