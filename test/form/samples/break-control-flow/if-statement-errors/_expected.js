while (true) {
	if (globalThis.unknown) break;
	console.log('retained');
}

while (true) {
	if (globalThis.unknown) ; else {
		break;
	}
	console.log('retained');
}
