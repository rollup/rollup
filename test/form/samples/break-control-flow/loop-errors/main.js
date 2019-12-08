function whileLoop() {
	console.log(hoisted);
	while (globalThis.unknown) {
		throw new Error();
		console.log('removed');
	}
	console.log('retained');
	throw new Error();
	while (globalThis.unknown) {
		var hoisted;
		console.log('removed');
	}
	console.log('removed');
}

try {
	whileLoop();
} catch {}

function doWhileLoop() {
	console.log(hoisted);
	do {
		if (globalThis.unknown) {
			break;
		}
		throw new Error();
		console.log('removed');
	} while (globalThis.unknown);
	console.log('retained');
	throw new Error();
	do {
		var hoisted;
		console.log('removed');
	} while (globalThis.unknown);
	console.log('removed');
}

try {
	doWhileLoop();
} catch {}

function forLoop() {
	console.log(hoisted);
	for (let i = 0; i < globalThis.unknown; i++) {
		throw new Error();
		console.log('removed');
	}
	console.log('retained');
	throw new Error();
	for (let i = 0; i < globalThis.unknown; i++) {
		var hoisted;
		console.log('removed');
	}
	console.log('removed');
}

try {
	forLoop();
} catch {}

function forOfLoop() {
	console.log(hoisted);
	for (const foo of globalThis.unknown) {
		throw new Error();
		console.log('removed');
	}
	console.log('retained');
	throw new Error();
	for (const foo of globalThis.unknown) {
		var hoisted;
		console.log('removed');
	}
	console.log('removed');
}

try {
	forOfLoop();
} catch {}

function forInLoop() {
	console.log(hoisted);
	for (const foo in globalThis.unknown) {
		throw new Error();
		console.log('removed');
	}
	console.log('retained');
	throw new Error();
	for (const foo in globalThis.unknown) {
		var hoisted;
		console.log('removed');
	}
	console.log('removed');
}

try {
	forInLoop();
} catch {}
