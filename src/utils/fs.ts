import fs from 'fs';
import { dirname } from './path';

export * from 'fs';

export const readFile = (file: string): Promise<string> =>
	new Promise<string>((fulfil, reject) =>
		fs.readFile(file, 'utf-8', (err, contents) => (err ? reject(err) : fulfil(contents)))
	);

function mkdirpath(path: string) {
	const dir = dirname(path);
	try {
		fs.readdirSync(dir);
	} catch {
		mkdirpath(dir);
		try {
			fs.mkdirSync(dir);
		} catch (err: any) {
			if (err.code !== 'EEXIST') {
				throw err;
			}
		}
	}
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
