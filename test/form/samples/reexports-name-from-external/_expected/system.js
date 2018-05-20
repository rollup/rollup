System.register('myBundle', ['external'], function (exports, module) {
	'use strict';
	return {
		setters: [function (module) {
			exports('foo', module.foo);
		}],
		execute: function () {



		}
	};
});
