try {
	throw new Error();
} catch (e) {
	const a = 1;
	function a() {}
}
