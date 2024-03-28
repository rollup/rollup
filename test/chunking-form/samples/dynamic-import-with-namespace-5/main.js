(async () => {
	const module = await import('./module');
	readBar(module);
	function readBar(module1) {
		module1.foo();
	}
})();
