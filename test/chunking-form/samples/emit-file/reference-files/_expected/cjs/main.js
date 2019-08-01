'use strict';

var showImage = require('./nested/chunk.js');

var logo = (typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __dirname + '/assets/logo1-a5ec488b.svg').href : new URL('assets/logo1-a5ec488b.svg', document.currentScript && document.currentScript.src || document.baseURI).href);

showImage.showImage(logo);
new Promise(function (resolve) { resolve(require('./nested/chunk2.js')); });
