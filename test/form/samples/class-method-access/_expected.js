console.log('retained');

class Used {
	static method() {}
	static get getter() {
		return { foo: { throws: null }, throws: null };
	}
}
Used.method.doesNotExist.throws;
Used.getter.doesNotExist.throws;
Used.getter.foo.doesNotExist.throws;
Used.getter.throws();
Used.getter.foo.throws();

Used.method.reassigned = 1;
Used.getter.reassigned = 2;
