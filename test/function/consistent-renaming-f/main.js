import bar from './bar';

export default function foo () {}

foo.prototype.a = function ( foo ) {
	return bar();
};

assert.equal( new foo().a(), 'consistent' );
