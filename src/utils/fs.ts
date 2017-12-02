import * as fs from 'fs';
import { dirname } from './path';
import _mkdirp from 'mkdirp';

export * from 'fs';

function mkdirpath (path: string) {
	const dir = dirname(path);
	try {
		fs.readdirSync(dir);
	} catch (err) {
		mkdirpath(dir);
		try {
			fs.mkdirSync(dir);
		} catch (err2) {
			if (err2.code !== 'EEXIST') {
				throw err2;
			}
		}
	}
}

export function writeFile (dest: string, data: string | Buffer) {
	return new Promise((fulfil, reject) => {
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

export function mkdirp (dir: string) {
	return new Promise((fulfil, reject) => {
		_mkdirp(dir, { fs }, (err: any) => {
			if (err) {
				reject(err);
			} else {
				fulfil();
			}
		});
	});
}
