class Foo {}

Foo.prototype.bar = {};

class Bar extends Foo {}

Bar.baz = {};

// Everything else should be removed
console.log('retained');
