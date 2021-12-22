import { promises as fs } from 'fs';
import { dirname } from './path';

export const { lstat, readdir, readFile, realpath } = fs;

export async function writeFile(dest: string, data: string | Uint8Array): Promise<void> {
	const dir = dirname(dest);
	await fs.mkdir(dir, { recursive: true });
	await fs.writeFile(dest, data);
}
