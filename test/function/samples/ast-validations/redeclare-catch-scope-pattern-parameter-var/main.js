try {
	throw new Error('failed');
} catch ({ message }) {
	var message;
}
