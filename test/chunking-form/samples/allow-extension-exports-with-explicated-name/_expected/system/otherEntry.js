System.register([], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			exports("fooInOtherEntry", fooInOtherEntry);

			function fooInOtherEntry() {
				console.log('hello world');
			}

		})
	};
}));
