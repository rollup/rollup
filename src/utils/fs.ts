import { promises as fs } from 'fs';
import { dirname } from './path';

export * from 'fs';

export async function writeFile(dest: string, data: string | Uint8Array): Promise<void> {
	await fs.mkdir(dirname(dest), { recursive: true });
	await fs.writeFile(dest, data);
}
