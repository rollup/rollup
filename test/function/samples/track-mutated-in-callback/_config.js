module.exports = defineTest({
	description: 'tracks mutations of variables in callbacks passed to globals',
	context: {
		globalFunction(callback) {
			callback(true);
		}
	}
});
