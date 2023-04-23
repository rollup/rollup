module.exports = defineTest({
	description: 'handles external aliased named imports that shadow another name',
	options: {
		external: ['acorn'],
		output: {
			globals: { acorn: 'acorn' }
		}
	}
});
