const path = require('node:path');

const isMember = module => /^m[AB]\.js$/.test(path.basename(module));

module.exports = defineTest({
	description:
		'creates no main<->manual chunk cycle in explicit mode when a dynamically loaded manual chunk is already fully loaded by its importer',
	options: {
		input: ['main.js'],
		output: {
			manualChunks: module => (isMember(module) ? 'manual' : null)
		}
	},
	async exports(exports) {
		await exports.promise;
	}
});
