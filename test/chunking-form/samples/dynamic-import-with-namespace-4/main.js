(async () => {
	const module = await import('./module');
	const { foo, ...rest } = module;
	foo();
	rest.bar();
})();
