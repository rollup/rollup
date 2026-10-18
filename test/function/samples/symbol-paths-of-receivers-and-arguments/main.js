function dispose() {
	assert.strictEqual({} instanceof this, false);
}

{
	using resource = {
		[Symbol.dispose]: dispose,
		[Symbol.hasInstance]() {}
	};
}

function isInstance(constructor) {
	return {} instanceof constructor;
}

assert.strictEqual(
	isInstance({
		[Symbol.hasInstance]() {
			return true;
		}
	}),
	true
);
