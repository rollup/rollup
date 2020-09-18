System.register([], function (exports) {
	'use strict';
	return {
		execute: function () {

			exports({
				commonjsRequire: commonjsRequire,
				createCommonjsModule: createCommonjsModule
			});

			function createCommonjsModule(fn, basedir, module) {
				return module = {
				  path: basedir,
				  exports: {},
				  require: function (path, base) {
			      return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
			    }
				}, fn(module, module.exports), module.exports;
			}

			function commonjsRequire () {
				throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
			}

		}
	};
});
