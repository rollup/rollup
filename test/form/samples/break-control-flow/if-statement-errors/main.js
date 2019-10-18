while (true) {
	if (globalThis.unknown) break;
	else {
		const unused = 1;
	}
	console.log('retained');
}

while (true) {
	if (globalThis.unknown) {
		const unused = 1;
	} else {
		break;
	}
	console.log('retained');
}
