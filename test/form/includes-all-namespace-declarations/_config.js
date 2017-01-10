module.exports = {
	description: 'includes all declarations referenced by reified namespaces',
	options: {
		onwarn: warning => {
			if ( warning.code !== 'EMPTY_BUNDLE' ) throw new Error( 'unexpected warning' );
		}
	}
}
