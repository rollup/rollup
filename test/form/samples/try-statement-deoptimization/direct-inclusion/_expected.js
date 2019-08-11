try {} catch {
	console.log('retained');
}

try {} catch {} finally {
	console.log('retained');
}

try {
	Object.create(null);
} catch {}
