(async () => {
	const module = await import('./generated-module1.js');
	module.foo();
	// disabled
	module[global.unknown]();
	module.baz();
})();

(async () => {
	const module = await import('./generated-module2.js');
	const module1 = module;
	module1.foo();
})();

(async () => {
	const module = await import('./generated-module3.js');
	const { foo } = module;
	foo();
})();

(async () => {
	const module = await import('./generated-module4.js');
	// disabled
	const { foo, ...rest } = module;
	foo();
	rest.bar();
})();

(async () => {
	const module = await import('./generated-module5.js');
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
	const module = await import('./generated-module6.js');
	function b({ foo }) {
		foo();
	}
	b(module);
})();

(async () => {
	const module = await import('./generated-module7.js');
	// disabled
	function b({ foo, ...rest }) {
		foo();
		assert.ok(rest);
	}
	b(module);
})();

(async () => {
	const module = await import('./generated-module8.js');
	// disabled
	function b(o1, ...rest) {
		assert.ok(rest);
	}
	b(o1, o2, module);
})();

(async () => {
	const module = await import('./generated-module9.js');
	// disabled
	function b({ foo = 1 }) {
		assert.ok(foo);
	}
	b(module);
})();

(async () => {
	const module = await import('./generated-module10.js');
	(module).bar();
	(global.unknown && module).foo();
	(global.unknown ? module : 'foo').baz();
})();
