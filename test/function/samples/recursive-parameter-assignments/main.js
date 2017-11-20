class Test {
	constructor ( name, opts ) {
		opts = opts || {};

		if ( name && typeof name === 'object' ) {
			opts = name;
			name = opts.name;
			delete opts.name;
		}

		this.name = name;
		this.opts = opts;
	}
}

new Test( 'a', {} );
