'use strict';

Promise.resolve().then(function () { return require('./generated-dynamic.js'); }).then(({ value }) => console.log(value));
