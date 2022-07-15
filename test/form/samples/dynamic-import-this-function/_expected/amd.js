define(['require', 'exports', 'input'], (function (require, exports, input) { 'use strict';

	function _interopNamespace(e) {
		if (e && e.__esModule) return e;
		var n = Object.create(null);
		if (e) {
			Object.keys(e).forEach(function (k) {
				if (k !== 'default') {
					var d = Object.getOwnPropertyDescriptor(e, k);
					Object.defineProperty(n, k, d.get ? d : {
						enumerable: true,
						get: function () { return e[k]; }
					});
				}
			});
		}
		n.default = e;
		return Object.freeze(n);
	}

	class Importer {
		constructor() {
			this.outputPath = input.outputPath;
		}

		getImport() {
			return (function (t) { return new Promise(function (resolve, reject) { require([t], function (m) { resolve(/*#__PURE__*/_interopNamespace(m)); }, reject); }); })(this.outputPath);
		}
	}

	const promise = new Importer().getImport();

	exports.promise = promise;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
