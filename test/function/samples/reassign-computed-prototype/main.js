function Foo() {}
function Bar() {}

Foo[proto].baz = function () { return 'foo'; };
Bar[proto] = Foo[proto];
Bar.prototype.baz = function () { return 'bar'; };

assert.equal( new Foo().baz(), 'bar' );
