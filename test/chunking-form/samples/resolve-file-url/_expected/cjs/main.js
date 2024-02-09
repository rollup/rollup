'use strict';

const asset$1 = 'resolved';
const chunk$1 = 'resolved';

const asset = (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__dirname + '/assets/asset-unresolved-B7Qh6_pN.txt').href : new URL('assets/asset-unresolved-B7Qh6_pN.txt', document.currentScript && document.currentScript.src || document.baseURI).href);
const chunk = (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__dirname + '/nested/chunk2.js').href : new URL('nested/chunk2.js', document.currentScript && document.currentScript.src || document.baseURI).href);

Promise.resolve().then(function () { return require('./nested/chunk.js'); }).then(result => console.log(result, chunk$1, chunk, asset$1, asset));
