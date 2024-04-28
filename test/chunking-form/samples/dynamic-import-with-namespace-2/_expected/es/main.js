(async () => {
	const module = await import('./generated-module.js');
	const module1 = module;
	module1.foo();
})();
