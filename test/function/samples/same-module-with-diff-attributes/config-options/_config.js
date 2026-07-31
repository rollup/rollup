const assert = require('assert');
module.exports = defineTest({
	description: 'passes the right arguments to configuration options function',
	options: {
		external: (_s, _importer, _isResolved, { attributes, importerAttributes, importerRawId }) => {
			assert.ok(attributes);
			assert.ok(importerAttributes);
			assert.ok(importerRawId);
			return attributes.type === 'type1';
		},
		output: {
			format: 'iife',
			globals: (_id, { attributes }) => {
				return attributes.type;
			},
			paths: (_id, { attributes }) => {
				assert.equal(attributes.type, 'type1');
				return attributes.type;
			}
		}
	},
	context: {
		type1: 'type1'
	}
});
