const condition = globalThis.unknown;

label1: while (condition) {
	if (condition) {
		continue label1;
	}
	console.log('effect');
}

label1NoEffect: while (condition) {
	if (condition) {
		continue label1NoEffect;
	}
}

label2: while (condition) {
	while (condition) {
		if (condition) {
			continue label2;
		}
	}
	console.log('effect');
}
