'use strict';

Promise.resolve(require('./foo.js')).then(result => console.log(result));
