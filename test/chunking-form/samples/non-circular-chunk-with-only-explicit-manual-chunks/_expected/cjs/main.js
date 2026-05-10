'use strict';

Promise.resolve().then(function () { return require('./generated-a.js'); }).then(({a}) => console.log(a));
Promise.resolve().then(function () { return require('./generated-b.js'); }).then(({b}) => console.log(b));
