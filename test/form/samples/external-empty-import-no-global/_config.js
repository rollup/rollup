module.exports = {
	description: 'does not expect a global to be provided for empty imports (#1217)',
	options: {
		external: [ 'babel-polyfill' ],
		moduleName: 'myBundle',
		onwarn ( warning ) {
			throw new Error( warning.message );
		}
	}
};
