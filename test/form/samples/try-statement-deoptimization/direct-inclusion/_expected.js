try {} catch {} finally {
	console.log('retained');
} // this will be retained

try {
	Object.create(null); // this will be retained
} catch {}
