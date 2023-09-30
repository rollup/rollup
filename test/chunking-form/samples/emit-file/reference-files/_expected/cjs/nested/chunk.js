'use strict';

var main = require('../main.js');

var logo = (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__dirname + '/../assets/logo2-yX706C0w.svg').href : new URL('../assets/logo2-yX706C0w.svg', document.currentScript && document.currentScript.src || document.baseURI).href);

main.showImage(logo);
