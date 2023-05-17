const TIMEOUT_MINUTES = 2;

setTimeout(() => {
	console.error('Script aborted due to timeout.');
	process.exit(1);
}, 1000 * 60 * TIMEOUT_MINUTES);
