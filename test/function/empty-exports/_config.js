module.exports = {
	description: 'warns on export {}, but does not fail',
	warnings: [
		{
			code: 'EMPTY_EXPORT',
			message: 'Empty export declaration',
			pos: 0,
			loc: {
				file: require( 'path' ).resolve( __dirname, 'main.js' ),
				line: 1,
				column: 0
			},
			frame: `
				1: export {};
				   ^
			`
		},
		{
			code: 'EMPTY_BUNDLE',
			message: 'Generated an empty bundle'
		}
	]
};
