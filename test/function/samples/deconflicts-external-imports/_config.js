module.exports = defineRollupTest({
	description: 'deconflicts external imports',
	context: {
		require(id) {
			return function () {
				return id;
			};
		}
	},
	options: {
		external: ['foo', 'bar']
	}
});
