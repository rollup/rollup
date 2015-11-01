var env;

if ( typeof window !== 'undefined' ) {
	env = function () {
		return 'browser';
	};
} else {
	env = function () {
		return 'node';
	};
}

export { env };
