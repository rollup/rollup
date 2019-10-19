function errorTry() {
	try {
		throw new Error('Break');
		console.log('removed');
	} catch {
		console.log('retained');
	} finally {
		console.log('retained');
	}

	console.log('retained');
}

try {
	errorTry();
} catch {}

function errorCatch() {
	try {
		console.log('retained');
	} catch {
		throw new Error('Break');
		console.log('removed');
	} finally {
		console.log('retained');
	}

	console.log('retained');
}

try {
	errorCatch();
} catch {}

function errorFinally() {
	try {
		console.log('retained');
	} catch {
		console.log('retained');
	} finally {
		throw new Error('Break');
		console.log('removed');
	}

	console.log('removed');
}

try {
	errorFinally();
} catch {}

function tryAfterError() {
	console.log(hoisted1, hoisted2, hoisted3);
	throw new Error();
	try {
		console.log('removed');
		var hoisted1;
	} catch {
		console.log('removed');
		var hoisted2;
	} finally {
		console.log('removed');
		var hoisted3;
	}
	console.log('removed');
}

try {
	tryAfterError();
} catch {}

function errorTryNoCatch() {
	try {
		throw new Error('Break');
		console.log('removed');
	} finally {
		console.log('retained');
	}

	console.log('retained');
}

try {
	errorTryNoCatch();
} catch {}
