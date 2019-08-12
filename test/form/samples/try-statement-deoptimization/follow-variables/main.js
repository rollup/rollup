function properlyTreeshaken() {
	Object.create(null);
}

try {
	properlyTreeshaken();
} catch {}
