'use strict';

const value = 42;

console.log(value);
Promise.resolve().then(function () { return require('./generated-dynamicDep.js'); });
const dep = 'dep';

exports.dep = dep;
exports.value = value;
