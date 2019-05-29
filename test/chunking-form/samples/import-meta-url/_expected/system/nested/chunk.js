System.register([], function (exports) {
	'use strict';
	return {
		execute: function () {

			exports('l', log);

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
