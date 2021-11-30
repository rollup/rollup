import fs from 'fs';
import { dirname } from './path';

export * from 'fs';

export const readFile = (file: string): Promise<string> =>
	new Promise<string>((fulfil, reject) =>
		fs.readFile(file, 'utf-8', (err, contents) => (err ? reject(err) : fulfil(contents)))
	);

function mkdirpath(path: string) {
	const dir = dirname(path);
	fs.mkdirSync(dir, { recursive: true });
}

export function writeFile(dest: string, data: string | Uint8Array): Promise<void> {
	return new Promise<void>((fulfil, reject) => {
		mkdirpath(dest);

		fs.writeFile(dest, data, err => {
			if (err) {
				reject(err);
			} else {
				fulfil();
			}
		});
	});
}
