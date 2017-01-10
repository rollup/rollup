module.exports = {
	description: 'discards effects in conditional expressions with known test values',
	options: {
		onwarn: warning => {
			if ( warning.code !== 'EMPTY_BUNDLE' ) throw new Error( 'unexpected warning' );
		}
	}
};
