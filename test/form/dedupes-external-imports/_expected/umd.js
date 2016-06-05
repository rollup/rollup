(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('external')) :
	typeof define === 'function' && define.amd ? define(['exports', 'external'], factory) :
	(factory((global.myBundle = global.myBundle || {}),global.external));
}(this, function (exports,external) { 'use strict';

	class Foo extends external.Component {
		constructor () {
			super();
			this.isFoo = true;
		}
	}

	class Bar extends external.Component {
		constructor () {
			super();
			this.isBar = true;
		}
	}

	class Baz extends external.Component {
		constructor () {
			super();
			this.isBaz = true;
		}
	}

	const foo = new Foo();
	const bar = new Bar();
	const baz = new Baz();

	exports.foo = foo;
	exports.bar = bar;
	exports.baz = baz;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
