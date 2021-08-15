(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.bundle = {}));
})(this, (function (exports) { 'use strict';

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
	};
	c.bar = bar;

	const e = () => console.log( 'e' );
	e.baz = baz;

	class g {
		constructor () {
			console.log( 'g' );
		}
	}

	g.foo = foo;

	const i = class {
		constructor () {
			console.log( 'i' );
		}
	};
	i.foo = foo;

	exports.a = a;
	exports.c = c;
	exports.e = e;
	exports.g = g;
	exports.i = i;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
