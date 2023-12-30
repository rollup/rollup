System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			exports("l", log);

			function log(url) {
				if (typeof document === 'undefined') {
					console.log(url);
				} else {
					document.body.innerHTML += url + '<br>';
				}
			}

			log('main: ' + module.meta.url);
			module.import('./nested/chunk.js');

		})
	};
}));
