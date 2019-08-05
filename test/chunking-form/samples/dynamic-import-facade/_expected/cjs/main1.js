'use strict';

new Promise(function (resolve) { resolve(require('./generated-dynamic2.js')); }).then(({dynamic}) => console.log('main1', dynamic));
