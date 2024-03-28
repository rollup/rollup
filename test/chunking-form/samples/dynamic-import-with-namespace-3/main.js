(async () => {
	const module = await import('./module');
	const { foo } = module;
	foo();
})();
