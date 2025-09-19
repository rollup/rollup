'use strict';

// Test string URL replacement
							const assetString = (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__dirname + '/assets/test-r6af3lUh.txt').href : new URL('assets/test-r6af3lUh.txt', document.currentScript && document.currentScript.tagName.toUpperCase() === 'SCRIPT' && document.currentScript.src || document.baseURI).href);
							// Test URL object replacement
							const assetObject = (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__dirname + '/assets/test-r6af3lUh.txt') : new URL('assets/test-r6af3lUh.txt', document.currentScript && document.currentScript.tagName.toUpperCase() === 'SCRIPT' && document.currentScript.src || document.baseURI));

console.log('String URL:', assetString);
console.log('URL Object:', assetObject);
