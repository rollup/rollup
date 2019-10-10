while (globalThis.unknown) {
	console.log('retained');
	break;
}

{
	console.log('retained');
}

while (globalThis.unknown) {
	console.log('retained');
	continue;
}

{
	console.log('retained');
}

do {
	console.log('retained');
	break;
} while (globalThis.unknown);

{
	console.log('retained');
}

for (let i = 0; i < globalThis.unknown; i++) {
	console.log('retained');
	break;
}

{
	console.log('retained');
}

for (const foo of globalThis.unknown) {
	console.log('retained');
	break;
}

{
	for (const foo of globalThis.unknown) {
		break;
	}
	console.log('retained');
}

for (const foo in globalThis.unknown) {
	console.log('retained');
	break;
}

{
	console.log('retained');
}
