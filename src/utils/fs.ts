import { promises as fs } from 'fs';
import { dirname } from './path';

export const { lstat, readdir, realpath } = fs;

export function readFile(file: string): Promise<string> {
	return fs.readFile(file, 'utf8');
}

async function mkdirpath(path: string): Promise<void> {
	const dir = dirname(path);
	await fs.mkdir(dir, { recursive: true });
}

export async function writeFile(dest: string, data: string | Uint8Array): Promise<void> {
	await mkdirpath(dest);

	await fs.writeFile(dest, data);
}
