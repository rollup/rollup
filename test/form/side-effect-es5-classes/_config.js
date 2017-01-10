module.exports = {
	description: 'omits ES5 classes which are pure (e.g. they only assign to `this`)',
	options: {
		onwarn ( warning ) {
			if ( warning.code !== 'THIS_IS_UNDEFINED' ) throw new Error( 'unexpected warning' );
		}
	}
};
