const assert = require('assert');

module.exports = {
	description:
		'namespaces should be non-extensible and its properties immutatable and non-configurable',

	exports(exports) {
		const ns = exports.ns;

		function extend(obj) {
			'use strict';
			obj.newProperty = true;
		}

		function reconfigure(obj) {
			Object.defineProperty(obj, 'a', { value: null });
		}

		function mutate(obj) {
			'use strict';
			obj.a = 2;
		}

		assert.throws(() => {
			extend(ns);
		});

		assert.throws(() => {
			reconfigure(ns);
		});

		assert.throws(() => {
			mutate(ns);
		});
	}
};
