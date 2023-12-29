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

			const c = exports("c", function () {
				console.log( 'c' );
			});
			c.bar = bar;

			const e = exports("e", () => console.log( 'e' ));
			e.baz = baz;

			class g {
				constructor () {
					console.log( 'g' );
				}
			} exports("g", g);

			g.foo = foo;

			const i = exports("i", class {
				constructor () {
					console.log( 'i' );
				}
			});
			i.foo = foo;

		})
	};
}));
