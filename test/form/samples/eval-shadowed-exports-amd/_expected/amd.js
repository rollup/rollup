define('test/module', ['exports'], (function (exports) {

	var modules = {
		foo: (unused, exports) => {
			eval('exports.bar = 1');
		}
	};

	exports.default = modules;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
