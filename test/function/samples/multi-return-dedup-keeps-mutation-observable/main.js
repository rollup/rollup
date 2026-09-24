const shared = { value: 0 };

function factory() {
	if (Math.random() > 0.5) return () => shared;
	return () => shared;
}

factory()().value = 42;

assert.equal(shared.value, 42);
