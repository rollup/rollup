'use strict';

var asset2 = (typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __dirname + '/logo2.svg').href : new URL('logo2.svg', document.currentScript && document.currentScript.src || document.baseURI).href);

{
	const image = document.createElement('img');
	image.src = asset2;
	document.body.appendChild(image);
}
