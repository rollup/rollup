(async () => {
	const module = await import('./generated-module.js');
	const { foo } = module;
	foo();
})();
