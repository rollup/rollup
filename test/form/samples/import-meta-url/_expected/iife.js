(function () {
	'use strict';

	console.log((typeof document !== 'undefined' ? document.currentScript && document.currentScript.src || location.href : new URL('file:' + __filename).href));

}());
