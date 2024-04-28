(async () => {
	const module = await import('./generated-module.js');
	readBar(module);
	function readBar(module1) {
		module1.foo();
	}
})();
