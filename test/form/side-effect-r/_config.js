module.exports = {
	description: 'discards unused function expression assigned to a variable that calls itself and a global',
	options: {
		onwarn: warning => {
			if ( warning.code !== 'EMPTY_BUNDLE' ) throw new Error( 'unexpected warning' );
		}
	}
};
