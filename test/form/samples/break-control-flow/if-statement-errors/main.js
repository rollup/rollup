function unknownValueConsequent() {
	if (globalThis.unknownValue) {
		throw new Error();
		console.log('removed');
	} else {
		console.log('retained');
	}
	console.log('retained');
}

try {
	unknownValueConsequent();
} catch {}

function unknownValueOnlyConsequent() {
	if (globalThis.unknownValue) {
		throw new Error();
		console.log('removed');
	}
	console.log('retained');
}

try {
	unknownValueOnlyConsequent();
} catch {}

function unknownValueAlternate() {
	if (globalThis.unknownValue) {
		console.log('retained');
	} else {
		throw new Error();
		console.log('removed');
	}
	console.log('retained');
}

try {
	unknownValueAlternate();
} catch {}

function unknownValueBoth() {
	if (globalThis.unknownValue) {
		throw new Error();
		console.log('removed');
	} else {
		throw new Error();
		console.log('removed');
	}
	console.log('removed');
}

try {
	unknownValueBoth();
} catch {}

function unknownValueAfterError() {
	console.log(hoisted1, hoisted2);
	throw new Error();
	if (globalThis.unknownValue) {
		console.log('removed');
		var hoisted1;
	} else {
		console.log('removed');
		var hoisted2;
	}
	console.log('removed');
}

try {
	unknownValueAfterError();
} catch {}

function truthyValueConsequent() {
	if (true) {
		throw new Error();
		console.log('removed');
	} else {
		console.log('removed');
	}
	console.log('removed');
}

try {
	truthyValueConsequent();
} catch {}

function truthyValueAlternate() {
	if (true) {
		console.log('retained');
	} else {
		throw new Error();
	}
	console.log('retained');
}

try {
	truthyValueAlternate();
} catch {}

function falsyValueConsequent() {
	if (false) {
		throw new Error();
	} else {
		console.log('retained');
	}
	console.log('retained');
}

try {
	falsyValueConsequent();
} catch {}

function falsyValueAlternate() {
	if (false) {
		console.log('removed');
	} else {
		throw new Error();
		console.log('removed');
	}
	console.log('removed');
}

try {
	falsyValueAlternate();
} catch {}
