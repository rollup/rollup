'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function foo () {
	console.log( 'foo' );
}

function a () {
	console.log( 'a' );
}

a.foo = foo;

const bar = function () {
	console.log( 'bar' );
};

const c = function () {
	console.log( 'c' );
};

c.bar = bar;

const baz = () => console.log( 'baz' );

const e = () => console.log( 'c' );

e.baz = baz;

exports.a = a;
exports.c = c;
exports.e = e;
