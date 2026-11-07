(async function () {
	const qux = await import('./dep.js');
	console.log(qux.value);
})();
