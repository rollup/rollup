(async () => {
	const module = await import('./generated-module.js');
	(module).bar();
	(global.unknown && module).foo();
	(global.unknown ? module : 'foo').baz();
})();
