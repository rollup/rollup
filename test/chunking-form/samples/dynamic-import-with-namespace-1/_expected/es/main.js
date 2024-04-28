(async () => {
	const module = await import('./generated-module.js');
	module.foo();
	module[global.unknown]();
	module.baz();
})();
