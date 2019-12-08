function noEffect1(x, y) {
	return () => x;
}

function noEffect2() {
	return () => {};
}

(globalThis.unknown ? noEffect1 : noEffect2)()();
console.log('retained');
