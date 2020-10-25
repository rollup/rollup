import { resolve } from 'path';

export default async function importCustomConfigPlugin(
	configPath: string,
	customPlugin: any,
	extension: string
) {
	let plugin = customPlugin;
	if (!plugin || plugin === true) {
		switch (extension) {
			case '.ts':
				plugin = '@rollup/plugin-typescript';
				break;

			default:
				throw new Error('some error'); // TODO
		}
	}
	try {
		return (await import(resolve(configPath, '../', 'node_modules/', plugin))).default();
	} catch {
		throw new Error(
			'Please install @rollup/plugin-typescript or use another config file extension.'
		);
	}
}
