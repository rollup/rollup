const wrapper = {
	foo() {
		assert.notEqual(this, wrapper)
	}
};

// Indirectly called member expressions set the callee's context to global "this"
(true && wrapper.foo)();
(true ? wrapper.foo : null)();
(1, 2, wrapper.foo)();
(true && (true && wrapper.foo))();
(true && (true ? wrapper.foo : null))();
(true && (1, 2, wrapper.foo))();

// Indirectly invoked eval is executed in the global scope
function testEval() {
	assert.notEqual((true && eval)('this'), 'test');
	assert.notEqual((true ? eval : null)('this'), 'test');
	assert.notEqual((1, 2, eval)('this'), 'test');
}

testEval.call('test');
