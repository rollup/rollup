import bar from './bar';

export default function foo () {}

foo.prototype.a = function ( foo ) {
	var foo = foo;
	foo();
	return bar();
};

assert.equal( new foo().a(function () {}), 'consistent' );
