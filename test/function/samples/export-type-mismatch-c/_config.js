module.exports = {
	description: 'cannot have named exports if explicit export type is default',
	options: { output: { exports: 'none' } },
	generateError: {
		code: 'INVALID_EXPORT_OPTION',
		message: `'none' was specified for output.exports, but entry module has following exports: default`
	}
};
