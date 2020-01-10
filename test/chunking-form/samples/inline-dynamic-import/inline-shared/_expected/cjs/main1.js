'use strict';

require('./generated-inlined.js');

new Promise(function (resolve) { resolve(require('./generated-inlined.js')); }).then(console.log);

console.log('main1');
