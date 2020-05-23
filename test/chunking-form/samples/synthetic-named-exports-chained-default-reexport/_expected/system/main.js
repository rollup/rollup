System.register(['./generated-main.js'], function (exports) {
	'use strict';
	return {
		setters: [function (module) {
			exports('component', module.c);
		}],
		execute: function () {



			exports('lib', lib.named.named);

		}
	};
});
