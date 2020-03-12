define(['module', 'require', 'exports'], function (module, require, exports) { 'use strict';

	function log(url) {
		if (typeof document === 'undefined') {
			console.log(url);
		} else {
			document.body.innerHTML += url + '<br>';
		}
	}

	log('main: ' + new URL(module.uri, document.baseURI).href);
	new Promise(function (resolve, reject) { require(['./chunk2'], resolve, reject) });

	exports.log = log;

});
