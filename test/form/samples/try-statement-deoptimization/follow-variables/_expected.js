function callGlobalRemoved() {
}

function callGlobalRetained() {
	Object.create(null);
	callGlobalRemoved();
}

try {
	callGlobalRetained();
} catch {}
