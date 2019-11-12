module.exports = {
	description: 'throws for invalid top-level-await format',
	options: {
		experimentalTopLevelAwait: true
	},
	generateError: {
		code: 'INVALID_TLA_FORMAT',
		message:
			'Module format cjs does not support top-level await. Use the "es" or "system" output formats rather.'
	}
};
