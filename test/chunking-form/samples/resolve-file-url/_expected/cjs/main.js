'use strict';

const asset$1 = 'resolved';
const chunk$1 = 'resolved';

const asset = (typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __dirname + '/assets/asset-unresolved-8dcd7fca.txt').href : new URL('assets/asset-unresolved-8dcd7fca.txt', document.currentScript && document.currentScript.src || document.baseURI).href);
const chunk = (typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __dirname + '/nested/chunk.js').href : new URL('nested/chunk.js', document.currentScript && document.currentScript.src || document.baseURI).href);

Promise.resolve().then(function () { return require('./nested/chunk2.js'); }).then(result => console.log(result, chunk$1, chunk, asset$1, asset));
