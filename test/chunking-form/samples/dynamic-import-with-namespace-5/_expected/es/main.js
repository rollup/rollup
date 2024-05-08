(async () => {
	const module = await import('./generated-module.js');
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
