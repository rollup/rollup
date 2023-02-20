import { readdir } from 'node:fs/promises';

export async function getFilesInDirectory(directory: URL): Promise<string[]> {
	return (await readdir(directory)).filter(file => file[0] !== '.');
}
