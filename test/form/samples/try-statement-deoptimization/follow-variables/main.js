function callGlobalTreeshaken() {
	Object.create(null);
}

function callGlobalRemoved() {
	Object.create(null);
	callGlobalTreeshaken();
}

function callGlobalRetained() {
	Object.create(null);
	callGlobalRemoved();
}

try {
	callGlobalRetained();
} catch {}
