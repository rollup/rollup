(function () {
	'use strict';

	console.log(({ url: (document.currentScript && document.currentScript.tagName.toUpperCase() === 'SCRIPT' && document.currentScript.src || new URL('iife.js', document.baseURI).href) }));

})();
