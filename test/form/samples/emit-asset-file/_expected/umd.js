(function (factory) {
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
}((function () { 'use strict';

	var logo = (typeof document === 'undefined' ? (typeof self === 'undefined' || typeof location === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __dirname + '/assets/logo-25585ac1.svg').href : location.href) : new URL('assets/logo-25585ac1.svg', document.currentScript && document.currentScript.src || document.baseURI).href);

	function showImage(url) {
		console.log(url);
		if (typeof document !== 'undefined') {
			const image = document.createElement('img');
			image.src = url;
			document.body.appendChild(image);
		}
	}

	showImage(logo);

})));
