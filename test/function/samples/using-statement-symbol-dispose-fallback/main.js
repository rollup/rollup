export async function run() {
	const calls = [];
	{
		await using resource = {
			label: 'missing',
			[Symbol.dispose]() {
				assert.strictEqual(arguments.length, 0);
				calls.push(this.label);
			}
		};
	}
	{
		await using resource = {
			[Symbol.asyncDispose]: null,
			[Symbol.dispose]() {
				calls.push('null');
			}
		};
	}
	{
		await using resource = {
			[Symbol.asyncDispose]: undefined,
			[Symbol.dispose]() {
				calls.push('undefined');
			}
		};
	}
	{
		await using resource = {
			get [Symbol.asyncDispose]() {
				calls.push('get asyncDispose');
				return null;
			},
			get [Symbol.dispose]() {
				calls.push('get dispose');
				return () => calls.push('dispose');
			}
		};
	}
	{
		await using resource = {
			async [Symbol.asyncDispose]() {
				await Promise.resolve();
				calls.push('asyncDispose');
			},
			get [Symbol.dispose]() {
				assert.fail('Symbol.dispose must not be read when Symbol.asyncDispose is available');
			}
		};
	}
	assert.deepStrictEqual(calls, [
		'missing',
		'null',
		'undefined',
		'get asyncDispose',
		'get dispose',
		'dispose',
		'asyncDispose'
	]);
}
