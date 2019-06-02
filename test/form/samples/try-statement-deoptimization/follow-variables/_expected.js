function callGlobal() {
	Object.create(null);
}

try {
	callGlobal();
} catch {}
