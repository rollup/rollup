Object.create(null); // this will be removed

try {} catch {} // this will be removed

try {} catch {
	Object.create(null); // this will be removed
	console.log('retained');
}

try {} catch {} finally {
	Object.create(null); // this will be removed
	console.log('retained');
}

try {
	Object.create(null);
} catch {}
