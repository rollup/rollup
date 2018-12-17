(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = global || self, factory(global.bundle = {}));
}(this, function (exports) { 'use strict';

	var effect = () => console.log( 'effect' );

	var { a } = { a: effect };
	a();

	var { x: b } = { x: effect };
	b();

	const s = {};
	var { c } = { c: s };
	c.foo = 1;

	const t = {};
	var { x: d } = { x: t };
	d.foo = 1;

	var e;
	({ e } = { e: effect });
	e();

	var f;
	({ x: f } = { x: effect });
	f();

	const u = {};
	var g;
	({ g } = { g: u });
	g.foo = 1;

	const v = {};
	var h;
	({ x: h } = { x: v });
	h.foo = 1;

	exports.s = s;
	exports.t = t;
	exports.u = u;
	exports.v = v;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
