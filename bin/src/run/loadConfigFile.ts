import path from 'path';
import rollup from 'rollup';
import tc from 'turbocolor';
import { InputOptions, RollupBuild, RollupOutput } from '../../../src/rollup/types';
import relativeId from '../../../src/utils/relativeId';
import { handleError, stderr } from '../logging';
import batchWarnings from './batchWarnings';

interface NodeModuleWithCompile extends NodeModule {
	_compile(code: string, filename: string): any;
}

export default function loadConfigFile(
	configFile: string,
	commandOptions: any = {}
): Promise<InputOptions[]> {
	const silent = commandOptions.silent || false;
	const warnings = batchWarnings();

	return rollup
		.rollup({
			input: configFile,
			treeshake: false,
			external: (id: string) => {
				return (id[0] !== '.' && !path.isAbsolute(id)) || id.slice(-5, id.length) === '.json';
			},
			onwarn: warnings.add
		})
		.then((bundle: RollupBuild) => {
			if (!silent && warnings.count > 0) {
				stderr(tc.bold(`loaded ${relativeId(configFile)} with warnings`));
				warnings.flush();
			}

			return bundle.generate({
				format: 'cjs'
			});
		})
		.then(({ output: [{ code }] }: RollupOutput) => {
			// temporarily override require
			const defaultLoader = require.extensions['.js'];
			require.extensions['.js'] = (module: NodeModuleWithCompile, filename: string) => {
				if (filename === configFile) {
					module._compile(code, filename);
				} else {
					defaultLoader(module, filename);
				}
			};

			delete require.cache[configFile];

			return Promise.resolve(require(configFile))
				.then(configFileContent => {
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
							url: 'https://rollupjs.org/guide/en#configuration-files'
						});
					}

					require.extensions['.js'] = defaultLoader;

					return Array.isArray(configs) ? configs : [configs];
				});
		});
}
