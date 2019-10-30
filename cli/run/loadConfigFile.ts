import path from 'path';
import tc from 'turbocolor';
import * as rollup from '../../src/node-entry';
import { RollupBuild, RollupOutput } from '../../src/rollup/types';
import { GenericConfigObject } from '../../src/utils/mergeOptions';
import relativeId from '../../src/utils/relativeId';
import { handleError, stderr } from '../logging';
import batchWarnings from './batchWarnings';

interface NodeModuleWithCompile extends NodeModule {
	_compile(code: string, filename: string): any;
}

export default function loadConfigFile(
	configFile: string,
	commandOptions: any = {}
): Promise<GenericConfigObject[]> {
	const silent = commandOptions.silent || false;
	const warnings = batchWarnings();

	return rollup
		.rollup({
			external: (id: string) =>
				(id[0] !== '.' && !path.isAbsolute(id)) || id.slice(-5, id.length) === '.json',
			input: configFile,
			onwarn: warnings.add,
			treeshake: false
		})
		.then((bundle: RollupBuild) => {
			if (!silent && warnings.count > 0) {
				stderr(tc.bold(`loaded ${relativeId(configFile)} with warnings`));
				warnings.flush();
			}

			return bundle.generate({
				exports: 'named',
				format: 'cjs'
			});
		})
		.then(({ output: [{ code }] }: RollupOutput) => {
			// temporarily override require
			const extensions = ['.js','.mjs'];
			const defaultLoaders = extensions.map(e => {
				const defaultLoader = require.extensions[e];
				require.extensions[e] = (module: NodeModule, filename: string) => {
					if (filename === configFile) {
						(module as NodeModuleWithCompile)._compile(code, filename);
					} else {
						defaultLoader(module, filename);
					}
				};	
				return defaultLoader;
			});

			delete require.cache[configFile];

			return Promise.resolve(require(configFile))
				.then(configFileContent => {
					if (configFileContent.default) configFileContent = configFileContent.default;
					if (typeof configFileContent === 'function') {
						return configFileContent(commandOptions);
					}
					return configFileContent;
				})
				.then(configs => {
					if (Object.keys(configs).length === 0) {
						handleError({
							code: 'MISSING_CONFIG',
							message: 'Config file must export an options object, or an array of options objects',
							url: 'https://rollupjs.org/guide/en/#configuration-files'
						});
					}

					extensions.forEach((extension,index) => require.extensions[extension] = defaultLoaders[index]);

					return Array.isArray(configs) ? configs : [configs];
				});
		});
}
