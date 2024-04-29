let created = false;

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
		// to make the function call not pure
		created = true;
	}
}

new Test( 'a', {} );
assert.equal( created, true );
