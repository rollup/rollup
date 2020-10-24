import { resolve } from 'path';

export default async (configPath: string) => {
	try {
		return (
			await import(resolve(configPath, '../', 'node_modules/@rollup/plugin-typescript'))
		).default();
	} catch {
		throw new Error('Please install @rollup/plugin-typescript or use a .js rollup config file.');
	}
};
