module.exports = defineTest({
	description: 'allows sharing imports between dynamic chunks',
	options: {
		preserveEntrySignatures: 'allow-extension'
	},
	exports(exports) {
		return exports.promise;
	}
});
