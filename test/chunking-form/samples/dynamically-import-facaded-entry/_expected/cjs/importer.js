'use strict';

new Promise(function (resolve) { resolve(require('./main.js')); }).then(result => console.log('importer', result));
