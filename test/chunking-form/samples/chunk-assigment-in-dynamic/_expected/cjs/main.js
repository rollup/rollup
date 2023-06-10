'use strict';

const importA = () => Promise.resolve().then(function () { return require('./generated-a.js'); });
const importB = () => Promise.resolve().then(function () { return require('./generated-b.js'); });

console.log(importA, importB);
