'use strict';

var dep = require('./generated-dep.js');

console.log('main1', dep.value);

Promise.resolve().then(function () { return require('./generated-dynamic.js'); }).then(result => console.log(result));
import('./external.js').then(result => console.log(result));
