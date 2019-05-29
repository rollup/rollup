System.register([], function () {
	'use strict';
	return {
		execute: function () {

			const items = [{}, {}, {}];

			for ( const a of items ) {
				a.foo = 'a';
			}

			let c;
			for ( c of items ) {
				c.bar = 'c';
			}

			for ( e of items ) {
				e.baz = 'e';
			}
			var e;

			assert.deepEqual( items, [
				{ foo: 'a', bar: 'c', baz: 'e' },
				{ foo: 'a', bar: 'c', baz: 'e' },
				{ foo: 'a', bar: 'c', baz: 'e' }
			]);

		}
	};
});
