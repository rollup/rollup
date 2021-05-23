class Removed {
	static get isTrue() {
		return true;
	}
}

if (Removed.isTrue) console.log('retained');
else console.log('removed');

class Used {
	static method() {}
	static get getter() {
		return { foo: {} };
	}
}

Used.method.doesNotExist;
Used.method.doesNotExist.throws;
Used.getter.doesNotExist;
Used.getter.doesNotExist.throws;
Used.getter.foo;
Used.getter.foo.doesNotExist;
Used.getter.foo.doesNotExist.throws;
Used.getter.hasOwnProperty('foo');
Used.getter.foo.hasOwnProperty('bar');
Used.getter.throws();
Used.getter.foo.throws();

Used.method.reassigned = 1;
Used.getter.reassigned = 2;

class ValueEffect {
	static foo
}