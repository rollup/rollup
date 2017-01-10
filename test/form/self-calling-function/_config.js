module.exports = {
	description: 'discards a self-calling function without side-effects',
	options: {
		onwarn: warning => {
			if ( warning.code !== 'EMPTY_BUNDLE' ) throw new Error( 'unexpected warning' );
		}
	}
};
