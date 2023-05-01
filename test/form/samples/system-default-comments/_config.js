module.exports = defineTest({
	description: 'Correctly places leading comments when rendering system default exports',
	options: {
		output: {
			format: 'system'
		}
	}
});
