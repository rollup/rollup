'use strict';

var __chunk_1 = require('./chunks/chunk.js');

CSS.paintWorklet.addModule((typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __dirname + '/chunks/worklet.js').href : new URL((document.currentScript && document.currentScript.src || document.baseURI) + '/../chunks/worklet.js').href));

document.body.innerHTML += `<h1 style="background-image: paint(vertical-lines);">color: ${__chunk_1.color}, size: ${__chunk_1.size}</h1>`;
