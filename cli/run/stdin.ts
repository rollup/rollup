import { Plugin } from '../../src/rollup/types';

export const stdinName = '-';

let stdinResult: Promise<string> | null = null;

export function stdinPlugin(): Plugin {
	return {
		name: 'stdin',
		resolveId(id) {
			if (id === stdinName) {
				return id;
			}
		},
		load(id) {
			if (id === stdinName) {
				return stdinResult || (stdinResult = readStdin());
			}
		}
	};
}

function readStdin(): Promise<string> {
	return new Promise((resolve, reject) => {
		const chunks: Buffer[] = [];
		process.stdin.setEncoding('utf8');
		process.stdin
			.on('data', chunk => chunks.push(chunk))
			.on('end', () => {
				const result = chunks.join('');
				resolve(result);
			})
			.on('error', err => {
				reject(err);
			});
	});
}
