'use strict';

Promise.resolve(require('./generated-dynamic.js')).then(({DYNAMIC_USED_BY_A}) => console.log(DYNAMIC_USED_BY_A));
