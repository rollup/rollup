switch (globalThis.unknown) {
	case 1:
		throw new Error();
	case 2:
		throw new Error();
	case 3:
		console.log('retained');
	default:
		console.log('retained');
}
console.log('retained');

console.log(hoisted1, hoisted2, hoisted3);
throw new Error();
switch (globalThis.unknown) {
	case 1:
		var hoisted1;
	case 2:
		var hoisted2;
	case 3:
		var hoisted3;
	default:
}
