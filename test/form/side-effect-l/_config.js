module.exports = {
	description: 'discards function with no side-effects in imported module',
	options: {
		onwarn: warning => {
			if ( warning.code !== 'EMPTY_BUNDLE' ) throw new Error( 'unexpected warning' );
		}
	}
};
