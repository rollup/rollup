export async function run() {
	const calls = [];
	{
		function disposeAsync() { using nested = this; }
		const resource = {
			[Symbol.dispose]() { calls.push('nested sync disposal'); },
			[Symbol.asyncDispose]: disposeAsync
		};
		await using captured = resource;
	}
	{
		function disposeAsync() {
			assert.strictEqual(typeof this[Symbol.dispose], 'function');
		}
		const resource = {
			[Symbol.dispose]() { assert.fail('sync method should only be read'); },
			[Symbol.asyncDispose]: disposeAsync
		};
		await using captured = resource;
	}
	{
		function disposeSync() {
			assert.strictEqual(typeof this[Symbol.asyncDispose], 'function');
		}
		const resource = {
			[Symbol.dispose]: disposeSync,
			[Symbol.asyncDispose]() { assert.fail('async method should only be read'); }
		};
		using captured = resource;
	}
	{
		const resource = {
			[Symbol.dispose]() { calls.push('mixed sync'); },
			[Symbol.asyncDispose]() { calls.push('mixed async'); }
		};
		const alias = resource;
		{ using captured = resource; }
		{ await using captured = alias; }
	}
	{
		const resource = {
			[Symbol.dispose]() { calls.push('deleted async'); },
			[Symbol.asyncDispose]() { assert.fail('deleted async method'); }
		};
		const alias = resource;
		delete alias[Symbol.asyncDispose];
		await using captured = resource;
	}
	{
		const resource = {
			[Symbol.dispose]() { calls.push('reassigned async'); },
			[Symbol.asyncDispose]() { assert.fail('reassigned async method'); }
		};
		const alias = resource;
		alias[Symbol.asyncDispose] = undefined;
		await using captured = resource;
	}
	{
		let key = Symbol.asyncDispose;
		function changeKey() { key = Symbol.dispose; }
		changeKey();
		const resource = {
			[key]() { calls.push('changed key'); }
		};
		const alias = resource;
		await using captured = alias;
	}
	{
		const resource = {
			[Symbol.dispose]() { calls.push('getter override'); },
			[Symbol.asyncDispose]() { assert.fail('overridden async method'); },
			get [Symbol.asyncDispose]() { return null; }
		};
		const alias = resource;
		await using captured = alias;
	}
	{
		const resource = {
			[Symbol.dispose]() { calls.push('spread override'); },
			[Symbol.asyncDispose]() { assert.fail('overridden async method'); },
			...{ [Symbol.asyncDispose]: null }
		};
		const alias = resource;
		await using captured = alias;
	}
	{
		const resource = {
			[Symbol.dispose]() { calls.push('delegated sync'); },
			[Symbol.asyncDispose]() { this[Symbol.dispose](); }
		};
		const alias = resource;
		await using captured = alias;
	}
	{
		function disposeAsync() {
			calls.push(this.label);
			this[Symbol.dispose]();
		}
		const disposer = disposeAsync;
		const resource = {
			label: 'assigned async label',
			[Symbol.dispose]() { calls.push('assigned async delegate'); },
			[Symbol.asyncDispose]: disposer
		};
		const alias = resource;
		await using captured = alias;
	}
	{
		const resource = {
			[Symbol.dispose]() { this[Symbol.asyncDispose](); },
			[Symbol.asyncDispose]() { calls.push('delegated async'); }
		};
		const alias = resource;
		using captured = alias;
	}
	{
		const prototype = {
			[Symbol.asyncDispose]() { this[Symbol.dispose](); }
		};
		const resource = {
			__proto__: prototype,
			[Symbol.dispose]() { calls.push('inherited async delegate'); }
		};
		const alias = resource;
		await using captured = alias;
	}
	{
		function disposeSync() {
			calls.push(this.label);
			this[Symbol.asyncDispose]();
		}
		const resource = {
			label: 'assigned sync label',
			[Symbol.dispose]: disposeSync,
			[Symbol.asyncDispose]() { calls.push('assigned sync delegate'); }
		};
		using captured = resource;
	}
	{
		function disposeSync() { calls.push(this.label); }
		const resource = {
			label: 'assigned sync fallback',
			[Symbol.dispose]: disposeSync
		};
		await using captured = resource;
	}
	{
		const prototype = {
			[Symbol.asyncDispose]() { assert.fail('shadowed inherited async method'); }
		};
		const resource = {
			__proto__: prototype,
			set [Symbol.asyncDispose](value) { assert.fail('setter must not be called'); },
			[Symbol.dispose]() { calls.push('setter shadows inherited async'); }
		};
		const alias = resource;
		await using captured = alias;
	}
	{
		const resource = {
			[Symbol.asyncDispose]() { assert.fail('method replaced by setter'); },
			set [Symbol.asyncDispose](value) { assert.fail('setter must not be called'); },
			[Symbol.dispose]() { calls.push('setter replaces async'); }
		};
		await using captured = resource;
	}
	{
		const key = Reflect.get(Symbol, 'asyncDispose');
		const resource = {
			[Symbol.asyncDispose]() { assert.fail('method replaced by computed setter'); },
			set [key](value) { assert.fail('setter must not be called'); },
			[Symbol.dispose]() { calls.push('computed setter replaces async'); }
		};
		await using captured = resource;
	}
	{
		const resource = {
			[Symbol.dispose]() { calls.push('late fallback'); },
			[Symbol.asyncDispose]() { calls.push('captured async'); }
		};
		async function useResource() {
			await using captured = resource;
			resource[Symbol.asyncDispose] = null;
		}
		await useResource();
		await useResource();
	}
	{
		const resource = {
			[Symbol.dispose]() { calls.push('uninitialized function'); },
			[Symbol.asyncDispose]: uninitializedDisposer
		};
		{
			await using captured = resource;
		}
		var uninitializedDisposer = () => assert.fail('function initialized after resource capture');
	}
	{
		async function useLexicalReceiver() {
			const resource = {
				label: 'incorrect resource receiver',
				[Symbol.dispose]() { assert.fail('async arrow must not fall back'); },
				[Symbol.asyncDispose]: () => calls.push(this.label)
			};
			await using captured = resource;
		}
		await useLexicalReceiver.call({ label: 'lexical outer label' });
	}
	{
		function disposeAsync() {
			const dispose = () => {
				calls.push(this.label);
				this[Symbol.dispose]();
			};
			dispose();
		}
		const resource = {
			label: 'nested arrow receiver',
			[Symbol.dispose]() { calls.push('nested arrow sync'); },
			[Symbol.asyncDispose]: disposeAsync
		};
		await using captured = resource;
	}
	{
		function disposeAsync() { calls.push(this.label); }
		const resource = {
			label: 'getter disposer',
			get [Symbol.asyncDispose]() { return disposeAsync; }
		};
		await using captured = resource;
	}
	{
		function disposeAsync() { calls.push(this.label); }
		const resource = {
			label: 'async assigned after null',
			[Symbol.asyncDispose]: null,
			[Symbol.dispose]() { calls.push('null async fallback'); }
		};
		async function useResource() {
			await using captured = resource;
			resource[Symbol.asyncDispose] = disposeAsync;
		}
		await useResource();
		await useResource();
	}
	assert.deepStrictEqual(calls, [
		'nested sync disposal',
		'mixed sync',
		'mixed async',
		'deleted async',
		'reassigned async',
		'changed key',
		'getter override',
		'spread override',
		'delegated sync',
		'assigned async label',
		'assigned async delegate',
		'delegated async',
		'inherited async delegate',
		'assigned sync label',
		'assigned sync delegate',
		'assigned sync fallback',
		'setter shadows inherited async',
		'setter replaces async',
		'computed setter replaces async',
		'captured async',
		'late fallback',
		'uninitialized function',
		'lexical outer label',
		'nested arrow receiver',
		'nested arrow sync',
		'getter disposer',
		'null async fallback',
		'async assigned after null'
	]);
}

export async function runConditionalDisposers(condition) {
	const calls = [];
	{
		function dispose() { calls.push(this.label); }
		using resource = condition
			? { label: 'first sync resource', [Symbol.dispose]: dispose }
			: { label: 'second sync resource', [Symbol.dispose]: dispose };
	}
	{
		function disposeAsync() { calls.push(this.label); }
		await using resource = condition
			? { label: 'first async resource', [Symbol.asyncDispose]: disposeAsync }
			: { label: 'second async resource', [Symbol.asyncDispose]: disposeAsync };
	}
	{
		function disposeFirst() {
			calls.push(this.label + ' first');
			this.disposed = true;
		}
		function disposeSecond() {
			calls.push(this.label + ' second');
			this.disposed = true;
		}
		const resource = {
			label: 'conditional disposer',
			disposed: false,
			[Symbol.dispose]: condition ? disposeFirst : disposeSecond
		};
		{ using captured = resource; }
		assert.strictEqual(resource.disposed ? 'disposed' : 'pending', 'disposed');
	}
	assert.deepStrictEqual(calls, [
		condition ? 'first sync resource' : 'second sync resource',
		condition ? 'first async resource' : 'second async resource',
		condition ? 'conditional disposer first' : 'conditional disposer second'
	]);
}
