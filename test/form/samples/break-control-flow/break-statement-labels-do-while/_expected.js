label: do {
	do {
		break;
	} while (globalThis.unknown());
	console.log('retained');
} while (globalThis.unknown());

do {
	label: do {
		break;
	} while (globalThis.unknown());
	console.log('retained');
} while (globalThis.unknown());

label: do {
	do {
		break label;
	} while (globalThis.unknown());
} while (globalThis.unknown());

label: do {
	do {
		continue;
	} while (globalThis.unknown());
	console.log('retained');
} while (globalThis.unknown());

do {
	label: do {
		continue;
	} while (globalThis.unknown());
	console.log('retained');
} while (globalThis.unknown());

label: do {
	do {
		continue label;
	} while (globalThis.unknown());
} while (globalThis.unknown());
