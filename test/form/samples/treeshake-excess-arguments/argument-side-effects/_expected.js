function sideEffects() {
	console.log('print message');
	return true;
}

function hola(a, b) {
	console.log(a);
}

hola(1, sideEffects());
