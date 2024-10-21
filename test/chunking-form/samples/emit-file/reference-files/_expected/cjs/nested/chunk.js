'use strict';

var main = require('../main.js');

var logo = (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__dirname + '/../assets/logo2-l7qbvg3v.svg').href : new URL('../assets/logo2-l7qbvg3v.svg', document.currentScript && document.currentScript.tagName.toUpperCase() === 'SCRIPT' && document.currentScript.src || document.baseURI).href);

main.showImage(logo);
