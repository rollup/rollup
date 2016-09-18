var Foo = (function() {
	function Foo() {}
	Foo.prototype.toString = function() { return 'foo'; };
	return Foo;
}());

var Bar = (function() {
	function Bar() {}
	Bar.prototype = Foo.prototype;
	Bar.prototype.toString = function() { return 'bar'; };
	return Bar;
}());

assert.equal( new Foo().toString(), 'bar' );
