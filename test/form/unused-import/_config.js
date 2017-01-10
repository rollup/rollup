module.exports = {
	description: 'excludes unused imports ([#595])',
	options: {
		external: [ 'external' ],
		onwarn ( warning ) {
			if ( warning.code !== 'UNUSED_EXTERNAL_IMPORT' && warning.code !== 'EMPTY_BUNDLE' ) throw new Error( 'unexpected warning' );
		}
	}
};
