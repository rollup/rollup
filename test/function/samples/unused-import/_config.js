module.exports = {
	description: 'warns on unused imports ([#595])',
	options: {
		external: ['external']
	},
	context: {
		require(id) {
			return {};
		}
	},
	warnings: [
		{
			code: 'UNUSED_EXTERNAL_IMPORT',
			source: 'external',
			names: ['notused', 'neverused'],
			message: `'notused' and 'neverused' are imported from external module 'external' but never used`
		}
	]
};
