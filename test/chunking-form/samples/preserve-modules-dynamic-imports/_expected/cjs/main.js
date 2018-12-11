'use strict';

Promise.resolve(require('./dynamic-included.js')).then(result => console.log(result));
