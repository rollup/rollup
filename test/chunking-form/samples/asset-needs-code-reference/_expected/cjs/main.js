'use strict';

var asset2 = (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__dirname + '/logo2.svg').href : new URL('logo2.svg', document.currentScript && document.currentScript.tagName.toUpperCase() === 'SCRIPT' && document.currentScript.src || document.baseURI).href);

{
	const image = document.createElement('img');
	image.src = asset2;
	document.body.appendChild(image);
}
