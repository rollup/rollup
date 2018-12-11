'use strict';

Promise.resolve(require('./generated-dynamic2.js')).then(result => console.log(result));
Promise.resolve(require('./generated-dynamic.js')).then(result => console.log(result));
