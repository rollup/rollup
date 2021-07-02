module.exports = {
	description: 'marks the treeshake.correctVarValueBeforeDeclaration option as deprecated',
	options: {
		treeshake: { correctVarValueBeforeDeclaration: true }
	},
	error: {
		code: 'DEPRECATED_FEATURE',
		message:
			'The "treeshake.correctVarValueBeforeDeclaration" option is deprecated and no longer has any effect. An improved algorithm is now in place that renders this option unnecessary.'
	}
};
