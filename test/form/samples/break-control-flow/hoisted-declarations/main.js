try {
	nested();
} catch {}

function nested() {
	hoisted();

	throw new Error();

	console.log('removed');

	function hoisted() {
		console.log('included');
	}

	console.log('removed');
}

hoisted();

throw new Error();

console.log('removed');

function hoisted() {
	console.log('included');
}

console.log('removed');
