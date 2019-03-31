define(['exports'], function (exports) { 'use strict';

	function log(url) {
		if (typeof document === 'undefined') {
			console.log(url);
		} else {
			document.body.innerHTML += url + '<br>';
		}
	}

	exports.log = log;

});
