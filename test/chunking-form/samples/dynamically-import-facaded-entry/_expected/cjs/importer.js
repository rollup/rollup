'use strict';

Promise.resolve().then(function () { return require('./main.js'); }).then(result => console.log('importer', result));
