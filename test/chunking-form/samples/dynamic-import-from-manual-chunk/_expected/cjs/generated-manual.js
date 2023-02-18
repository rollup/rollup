'use strict';

const dep2 = 'dep2';

console.log(dep2);
Promise.resolve().then(function () { return require('./generated-dynamic.js'); });

exports.dep2 = dep2;
