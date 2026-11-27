System.register('bundle', [], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			exports("a", a);

			function foo () {
				console.log( 'foo' );
			}

			const bar = function () {
				console.log( 'bar' );
			};

			const baz = () => console.log( 'baz' );

			function a () {
				console.log( 'a' );
			}

			a.foo = foo;

			const c = function () {
				console.log( 'c' );
			}; exports("c", c);
			c.bar = bar;

			const e = () => console.log( 'e' ); exports("e", e);
			e.baz = baz;

			class g {
				constructor () {
					console.log( 'g' );
				}
			} exports("g", g);

			g.foo = foo;

			const i = class {
				constructor () {
					console.log( 'i' );
				}
			}; exports("i", i);
			i.foo = foo;

		})
	};
}));
