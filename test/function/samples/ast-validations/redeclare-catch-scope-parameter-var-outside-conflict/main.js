let error;
try {
	throw new Error('failed');
} catch (error) {
	var error;
}
