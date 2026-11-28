System.register([], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			exports("p", preload);

			function preload(callback) {
				return callback();
			}

			function App() {
				return 'App';
			}

			var app = /*#__PURE__*/Object.freeze({
				__proto__: null,
				default: App
			});
			exports("a", app);

		})
	};
}));
