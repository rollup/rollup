const assert = require('node:assert');

module.exports = defineTest({
	description:
		'namespaces should be non-extensible and its properties immutatable and non-configurable',

	exports(exports) {
		const ns = exports.ns;

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
});

function extend(object) {
	'use strict';
	object.newProperty = true;
}

function reconfigure(object) {
	Object.defineProperty(object, 'a', { value: null });
}

function mutate(object) {
	'use strict';
	object.a = 2;
}
