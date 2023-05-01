module.exports = defineTest({
	description: 'does not rely on pure annotations if they are disabled',
	options: {
		treeshake: {
			annotations: false
		}
	}
});
