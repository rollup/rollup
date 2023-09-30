(function (factory) {
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
})((function () { 'use strict';

	var logo = (typeof document === 'undefined' && typeof location === 'undefined' ? require('u' + 'rl').pathToFileURL(__dirname + '/assets/logo-Mw5Zq12q.svg').href : new URL('assets/logo-Mw5Zq12q.svg', typeof document === 'undefined' ? location.href : document.currentScript && document.currentScript.src || document.baseURI).href);

	function showImage(url) {
		console.log(url);
		if (typeof document !== 'undefined') {
			const image = document.createElement('img');
			image.src = url;
			document.body.appendChild(image);
		}
	}

	showImage(logo);

}));
