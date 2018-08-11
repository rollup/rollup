import * as fs from 'fs';
import { dirname } from './path';

export * from 'fs';

function mkdirp(dir: string): Promise<void> {
	return new Promise<void>((resolve, reject) =>
		fs.mkdir(dir, err => (err ? reject(err) : resolve()))
	).catch(err => {
		if (err.code === 'ENOENT') return mkdirp(dirname(dir)).then(() => mkdirp(dir));
		else if (err.code === 'EEXIST') return;
		throw err;
	});
}

export function writeFile(path: string, data: string | Buffer) {
	return mkdirp(dirname(path)).then(
		() =>
			new Promise<void>((resolve, reject) =>
				fs.writeFile(path, data, err => (err ? reject(err) : resolve()))
			)
	);
}

export function readFile(path: string, encoding = 'utf-8'): Promise<Buffer> {
	return new Promise((resolve, reject) =>
		fs.readFile(path, encoding, (err, source) => (err ? reject(err) : resolve(<any>source)))
	);
}
