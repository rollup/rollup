const condition = globalThis.unknown;

label1: while (condition) {
	if (condition) {
		continue label1;
	}
	console.log('effect');
}

label2: while (condition) {
	while (condition) {
		if (condition) {
			continue label2;
		}
	}
	console.log('effect');
}
