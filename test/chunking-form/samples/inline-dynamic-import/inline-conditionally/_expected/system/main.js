System.register([], function () {
	'use strict';
	return {
		execute: function () {

			if (globalThis.unknown) {
				Promise.resolve().then(function () { return inlined; }).then(console.log);
			}

			console.log('main1');

			console.log('inlined');
			const value = 'inlined';

			var inlined = /*#__PURE__*/Object.freeze({
				__proto__: null,
				value: value
			});

		}
	};
});
