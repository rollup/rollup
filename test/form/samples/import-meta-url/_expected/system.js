System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			function log(url) {
				if (typeof document === 'undefined') {
					console.log(url);
				} else {
					document.body.innerText = url;
				}
			}

			log(module.meta.url);

		}
	};
});
