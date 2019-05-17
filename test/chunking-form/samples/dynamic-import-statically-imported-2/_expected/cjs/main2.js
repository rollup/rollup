'use strict';

Promise.resolve(require('./generated-dep1.js')).then(({ bar }) => console.log(bar()));
