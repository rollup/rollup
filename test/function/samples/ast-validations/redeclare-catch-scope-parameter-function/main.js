try {
	throw new Error('failed');
} catch (error) {
	function error() {}
}
