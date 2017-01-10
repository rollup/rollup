module.exports = {
	description: 'prefixes global names with `global.` when creating UMD bundle (#57)',
	options: {
		external: [ 'factory', 'baz', 'shipping-port', 'alphabet' ],
		onwarn: warning => {
			if ( warning.code !== 'UNUSED_EXTERNAL_IMPORT' ) throw new Error( 'unexpected warning' );
		}
	}
};
