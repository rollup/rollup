'use strict';

const asset = 'resolved';
const chunk = 'resolved';

const asset$1 = (typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __dirname + '/assets/asset-unresolved-9548436d.txt').href : new URL((document.currentScript && document.currentScript.src || document.baseURI) + '/../assets/asset-unresolved-9548436d.txt').href);
const chunk$1 = (typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __dirname + '/nested/chunk.js').href : new URL((document.currentScript && document.currentScript.src || document.baseURI) + '/../nested/chunk.js').href);

Promise.resolve(require('./nested/chunk2.js')).then(result => console.log(result, chunk, chunk$1, asset, asset$1));
