System.register(['./otherEntry.js'], (function (exports) {
	'use strict';
	return {
		setters: [function (module) {
			exports("fooInOtherEntry", module.fooInOtherEntry);
		}],
		execute: (function () {



		})
	};
}));
