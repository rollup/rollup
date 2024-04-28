(async () => {
	const module = await import('./module');
	const module1 = module;
	module1.foo();
})();
