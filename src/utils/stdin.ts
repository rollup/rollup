export const stdinName = '-';

let stdinResult: string | Error | null = null;
const pending: { reject: Function; resolve: Function }[] = [];

export function readStdin() {
	return new Promise<string>((resolve, reject) => {
		if (typeof process == 'undefined' || typeof process.stdin == 'undefined') {
			reject(new Error('stdin input is invalid in browser'));
			return;
		}
		pending.push({ resolve, reject });
		processPending();
		if (pending.length === 1) {
			// stdin is read once - all callers will get the same result

			const chunks: Buffer[] = [];
			process.stdin.setEncoding('utf8');
			process.stdin
				.on('data', chunk => {
					if (stdinResult === null) {
						chunks.push(chunk);
					}
				})
				.on('end', () => {
					if (stdinResult === null) {
						stdinResult = chunks.join('');
						chunks.length = 0;
					}
					processPending();
				})
				.on('error', err => {
					if (stdinResult === null) {
						stdinResult = err instanceof Error ? err : new Error(err);
						chunks.length = 0;
					}
					processPending();
				});
			process.stdin.resume();
		}
	});

	function processPending() {
		if (stdinResult !== null) {
			for (let it; (it = pending.shift()); ) {
				if (typeof stdinResult == 'string') {
					it.resolve(stdinResult);
				} else {
					it.reject(stdinResult);
				}
			}
		}
	}
}
