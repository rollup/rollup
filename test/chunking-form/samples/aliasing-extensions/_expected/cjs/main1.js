'use strict';

console.log('main1');
Promise.resolve().then(function () { return require('./generated-main4.dynamic.js'); });
Promise.resolve().then(function () { return require('./generated-main5.js'); });
