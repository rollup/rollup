'use strict';

new Promise(function (resolve) { resolve(require('./generated-dynamic.js')); }).then(function (n) { return n.dynamic$1; }).then(({dynamic}) => console.log('main1', dynamic));
