const assert = require('assert');

module.exports = {
	description: 'throw error if @rollup/plugin-typescript is not installed.',
	command: 'rollup --config rollup.config.ts',
	execute: true,
	error(err) {
		assert.ok(
			/Please install @rollup\/plugin-typescript or use a \.js rollup config file\./.test(
				err.message
			)
		);
	}
};
