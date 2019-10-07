function whileLoop() {
	console.log(hoisted);
	while (globalThis.unknown) {
		throw new Error();
	}
	console.log('retained');
	throw new Error();
	while (globalThis.unknown) {
		var hoisted;
	}
}

try {
	whileLoop();
} catch {}

function doWhileLoop() {
	console.log(hoisted);
	do {
		throw new Error();
	} while (globalThis.unknown);
	do {
		var hoisted;
	} while (globalThis.unknown);
}

try {
	doWhileLoop();
} catch {}

function forLoop() {
	console.log(hoisted);
	for (let i = 0; i < globalThis.unknown; i++) {
		throw new Error();
	}
	console.log('retained');
	throw new Error();
	for (let i = 0; i < globalThis.unknown; i++) {
		var hoisted;
	}
}

try {
	forLoop();
} catch {}

function forOfLoop() {
	console.log(hoisted);
	for (const foo of globalThis.unknown) {
		throw new Error();
	}
	console.log('retained');
	throw new Error();
	for (const foo of globalThis.unknown) {
		var hoisted;
	}
}

try {
	forOfLoop();
} catch {}

function forInLoop() {
	console.log(hoisted);
	for (const foo in globalThis.unknown) {
		throw new Error();
	}
	console.log('retained');
	throw new Error();
	for (const foo in globalThis.unknown) {
		var hoisted;
	}
}

try {
	forInLoop();
} catch {}
