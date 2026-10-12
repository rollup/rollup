const log = [];
function disposeViaNestedMethod() {
	this.nested.run();
}
{
	using resource = {
		nested: {
			value: 'nested method',
			run() {
				log.push(this.value);
			}
		},
		[Symbol.dispose]: disposeViaNestedMethod
	};
}
assert.deepStrictEqual(log, ['nested method']);
