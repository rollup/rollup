System.register(['./generated-main.js'], function (exports) {
	'use strict';
	var lib;
	return {
		setters: [function (module) {
			lib = module.l;
		}],
		execute: function () {

			var component = { lib, lib2: lib.named, lib3: lib.named.named };

			var component$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.assign(/*#__PURE__*/Object.create(null), component, {
				'default': component
			}));
			exports('c', component$1);

		}
	};
});
