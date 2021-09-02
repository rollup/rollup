System.register('bundle', ['external', 'externalDefaultOnly', 'external2'], (function (exports, module) {
	'use strict';
	var function$1, defaultOnly, someDefault;
	return {
		setters: [function (module) {
			function$1 = module["function"];
			exports({ bar: module["function"], 'default': module, 'void': module["default"] });
		}, function (module) {
			defaultOnly = module;
		}, function (module) {
			someDefault = module["default"];
		}],
		execute: (function () {

			var other = {
				foo: 'bar'
			};

			var ns = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.assign(/*#__PURE__*/Object.create(null), other, {
				'default': other
			}));

			console.log(ns, other.foo, other["function"], other["some-prop"], function$1, someDefault, defaultOnly);
			console.log(module.meta["function"], module.meta["some-prop"]);

			let f = exports('function', 1);
			exports('function', f + 1), f++;

		})
	};
}));
