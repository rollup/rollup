let Test$1 = class Test {
	static test = 'Test1';
	static {
		assert.ok(Test.test);
	}
};

class Test {
	static test = 'Test2';
	static {
		assert.ok(Test.test);
	}
}

assert.ok(Test$1.test);
assert.ok(Test.test);
