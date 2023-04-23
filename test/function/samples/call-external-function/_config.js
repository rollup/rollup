module.exports = defineTest({
	description: 'handles call of aliased external function (#957)',
	warnings() {},
	context: {
		require(id) {
			if (id === 'foo') {
				return () => 42;
			}
		}
	}
});
