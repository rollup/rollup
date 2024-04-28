(async () => {
	const module = await import('./generated-module.js');
	const { foo, ...rest } = module;
	foo();
	rest.bar();
})();
