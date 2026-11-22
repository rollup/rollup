System.register(['./generated-preload.js'], (function (exports, module) {
	'use strict';
	var preload;
	return {
		setters: [function (module) {
			preload = module.p;
		}],
		execute: (async function () {

			await preload(() => module.import('./generated-entry.js'));

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
