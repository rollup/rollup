(function (factory) {
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
})((function () { 'use strict';

	var _documentCurrentScript = typeof document !== 'undefined' ? document.currentScript : null;
	console.log('resolved');
	console.log('resolved');
	console.log('resolved');

	console.log((typeof document === 'undefined' && typeof location === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : typeof document === 'undefined' ? location.href : (_documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === 'SCRIPT' && _documentCurrentScript.src || new URL('umd.js', document.baseURI).href)));
	console.log(undefined);
	console.log(({ url: (typeof document === 'undefined' && typeof location === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : typeof document === 'undefined' ? location.href : (_documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === 'SCRIPT' && _documentCurrentScript.src || new URL('umd.js', document.baseURI).href)) }));

	console.log('url=umd.js:resolve-import-meta-url/main.js');
	console.log('privateProp=umd.js:resolve-import-meta-url/main.js');
	console.log('null=umd.js:resolve-import-meta-url/main.js');

}));
