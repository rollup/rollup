'use strict';

var shared = require('./chunks/shared.js');

CSS.paintWorklet.addModule((typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __dirname + '/chunks/worklet.js').href : new URL('chunks/worklet.js', document.currentScript && document.currentScript.src || document.baseURI).href));

document.body.innerHTML += `<h1 style="background-image: paint(vertical-lines);">color: ${shared.color}, size: ${shared.size}</h1>`;
