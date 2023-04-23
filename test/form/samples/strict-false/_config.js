module.exports = defineRollupTest({
	description: 'use strict should not be present',
	options: {
		output: {
			strict: false
		}
	}
});
