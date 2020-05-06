'use strict';

Promise.resolve().then(function () { return require('./main.js'); }).then(function (n) { return n.main; }).then(result => console.log('importer', result));
