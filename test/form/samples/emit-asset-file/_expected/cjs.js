'use strict';

var logo = (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__dirname + '/assets/logo-da3mn9ig.svg').href : new URL('assets/logo-da3mn9ig.svg', document.currentScript && document.currentScript.tagName.toUpperCase() === 'SCRIPT' && document.currentScript.src || document.baseURI).href);

var logoReverse = (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__dirname + '/assets/logo_reverse\'-m88qzsd0.svg').href : new URL('assets/logo_reverse\'-m88qzsd0.svg', document.currentScript && document.currentScript.tagName.toUpperCase() === 'SCRIPT' && document.currentScript.src || document.baseURI).href);

function showImage(url) {
	console.log(url);
	if (typeof document !== 'undefined') {
		const image = document.createElement('img');
		image.src = url;
		document.body.appendChild(image);
	}
}

showImage(logo);
showImage(logoReverse);
