module.exports = {
	description: 'allows custom module-specific context',
	options: {
		moduleContext: {
			'main.js': 'lolwut'
		},
		onwarn ( warning ) {
			if ( warning.code !== 'THIS_IS_UNDEFINED' ) throw new Error( 'unexpected warning' );
		}
	}
};
