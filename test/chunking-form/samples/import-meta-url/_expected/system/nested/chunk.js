System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			exports('a', log);

			function log(url) {
				if (typeof document === 'undefined') {
					console.log(url);
				} else {
					document.body.innerHTML += url + '<br>';
				}
			}

		}
	};
});
