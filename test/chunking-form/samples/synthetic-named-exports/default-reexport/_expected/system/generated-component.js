System.register(['./main.js'], function (exports) {
	'use strict';
	var lib;
	return {
		setters: [function (module) {
			lib = module.lib;
		}],
		execute: function () {

			var component = { lib, someExport: lib.someExport };

			var component$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.assign(/*#__PURE__*/Object.create(null), component, {
				'default': component
			}));
			exports('c', component$1);

		}
	};
});
