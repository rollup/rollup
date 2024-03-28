(async () => {
	const module = await import('./module');
	('foo', module).bar();
	(global.unknown && module).foo();
	(global.unknown ? module : 'foo').baz();
})();
