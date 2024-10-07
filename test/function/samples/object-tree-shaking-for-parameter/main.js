function foo() {
	function bar(input2) {
		return input2;
	}

	function Baz(input) {
		this.value = bar(input);
	}

	externalFunc(Baz);

	return new Baz({ next: 2 });
}

assert.deepEqual(foo().value.next, 2);
