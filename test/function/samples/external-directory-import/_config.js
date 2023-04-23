module.exports = defineTest({
	description: 'handles using ../ as external import (#4349)',
	options: {
		external() {
			return true;
		}
	},
	context: {
		require: id => id
	}
});
