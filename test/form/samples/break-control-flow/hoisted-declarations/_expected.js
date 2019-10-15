try {
	nested();
} catch {}

function nested() {
	hoisted();

	throw new Error();

	function hoisted() {
		console.log('included');
	}
}

hoisted();

throw new Error();

function hoisted() {
	console.log('included');
}
