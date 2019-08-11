'use strict';

const asset = 'resolved';
const chunk = 'resolved';

const asset$1 = (typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __dirname + '/assets/asset-unresolved-8dcd7fca.txt').href : new URL('assets/asset-unresolved-8dcd7fca.txt', document.currentScript && document.currentScript.src || document.baseURI).href);
const chunk$1 = (typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __dirname + '/nested/chunk.js').href : new URL('nested/chunk.js', document.currentScript && document.currentScript.src || document.baseURI).href);

new Promise(function (resolve) { resolve(require('./nested/chunk2.js')); }).then(result => console.log(result, chunk, chunk$1, asset, asset$1));
