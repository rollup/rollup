'use strict';

new Promise(function (resolve) { resolve(require('./generated-dynamic.js')); }).then(({dynamic}) => console.log('main1', dynamic));
