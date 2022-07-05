'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var logo = (typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __dirname + '/assets/logo1-60bc15c4.svg').href : new URL('assets/logo1-60bc15c4.svg', document.currentScript && document.currentScript.src || document.baseURI).href);

function showImage(url) {
	console.log(url);
	if (typeof document !== 'undefined') {
		const image = document.createElement('img');
		image.src = url;
		document.body.appendChild(image);
	}
}

showImage(logo);
Promise.resolve().then(function () { return require('./nested/chunk.js'); });

exports.showImage = showImage;
