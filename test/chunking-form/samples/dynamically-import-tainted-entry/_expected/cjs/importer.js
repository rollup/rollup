'use strict';

new Promise(function (resolve) { resolve(require('./main.js')); }).then(function (n) { return n.main; }).then(result => console.log('importer', result));
