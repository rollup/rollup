(async () => {
	const module = await import('./module');
	module.foo();
	// disabled
	module[global.unknown]();
	module.baz();
})();

(async () => {
	const module = await import('./module');
	const module1 = module;
	module1.foo();
})();

(async () => {
	const module = await import('./module');
	const { foo } = module;
	foo();
})();

(async () => {
	const module = await import('./module');
	// disabled
	const { foo, ...rest } = module;
	foo();
	rest.bar();
})();

(async () => {
	const module = await import('./module');
	readFoo({ foo: () => {} });
	readFoo(module);
	function readFoo(module1) {
		module1.foo();
	}
	function readBar(module2) {
		module2.bar();
	}
	readBar(module);
})();

(async () => {
	const module = await import('./module');
	function b({ foo }) {
		foo();
	}
	b(module);
})();

(async () => {
	const module = await import('./module');
	// disabled
	function b({ foo, ...rest }) {
		foo();
		assert.ok(rest);
	}
	b(module);
})();

(async () => {
	const module = await import('./module');
	// disabled
	function b(o1, ...rest) {
		assert.ok(rest);
	}
	b(o1, o2, module);
})();

(async () => {
	const module = await import('./module');
	// disabled
	function b({ foo = 1 }) {
		assert.ok(foo);
	}
	b(module);
})();

(async () => {
	const module = await import('./module');
	('foo', module).bar();
	(global.unknown && module).foo();
	(global.unknown ? module : 'foo').baz();
})();
