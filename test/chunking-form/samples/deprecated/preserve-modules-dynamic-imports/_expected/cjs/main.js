'use strict';

Promise.resolve().then(function () { return require('./dynamic-included.js'); }).then(result => console.log(result));
