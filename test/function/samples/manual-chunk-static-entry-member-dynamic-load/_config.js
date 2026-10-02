module.exports = defineTest({
	description:
		'keeps manual chunk members that are also static entries static while another member is dynamically imported and runs all side effects exactly once',
	options: {
		input: ['other.js', 'main.js'],
		output: {
			manualChunks: {
				manual: ['mA.js', 'mB.js', 'other.js']
			}
		}
	},
	async exports(exports) {
		await exports.promise;
	}
});
