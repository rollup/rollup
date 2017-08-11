import baz from './baz';

export function Foo () {}

Foo.prototype.test = function () {
	return 'nope';
};

export function Bar () {}

Bar.prototype = Object.create( Foo.prototype );

Bar.prototype.test = function () {
	return baz;
};
