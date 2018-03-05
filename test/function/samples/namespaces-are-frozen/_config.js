var assert = require('assert');

module.exports = {
	description: 'namespaces should be non-extensible and its properties immutatable and non-configurable',

	exports: function(exports) {
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

		assert.throws(function() {
			extend(ns);
		});

		assert.throws(function() {
			reconfigure(ns);
		});

		assert.throws(function() {
			mutate(ns);
		});
	}
};
