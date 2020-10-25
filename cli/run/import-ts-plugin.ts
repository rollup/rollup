import { resolve } from 'path';

export default async (configPath: string, tsPlugin: any) => {
	const plugin = tsPlugin || '@rollup/plugin-typescript';
	try {
		return (await import(resolve(configPath, '../', 'node_modules/', plugin))).default();
	} catch {
		throw new Error(
			'Please install @rollup/plugin-typescript or use another config file extension.'
		);
	}
};
