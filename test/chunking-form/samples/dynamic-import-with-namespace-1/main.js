(async () => {
	const module = await import('./module');
	module.foo();
	module[global.unknown]();
	module.baz();
})();
