Object.create(null); // this will be removed

try {} catch {} finally {} // this will be removed

try {} catch {
	console.log('removed');
} // this will be removed

try {} catch {} finally {
	Object.create(null); // this will be removed
	console.log('retained');
} // this will be retained

try {
	Object.create(null); // this will be retained
} catch {}
