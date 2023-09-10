(function () {
	'use strict';

	var _documentCurrentScript = typeof document !== 'undefined' ? document.currentScript : null;
	console.log(({ url: (_documentCurrentScript && _documentCurrentScript.src || new URL('iife.js', document.baseURI).href) }));

})();
