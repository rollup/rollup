import buble from 'rollup-plugin-buble'
import path from 'path';
import chalk from 'chalk';
import * as rollup from 'rollup';
import batchWarnings from './batchWarnings.js';
import relativeId from '../../../src/utils/relativeId.js';
import { handleError, stderr } from '../logging.js';

export default function loadConfigFile (configFile, silent) {
	const warnings = batchWarnings();

	return rollup.rollup({
		input: configFile,
		external: id => {
			return (id[0] !== '.' && !path.isAbsolute(id)) || id.slice(-5,id.length) === '.json';
		},
		onwarn: warnings.add,
		plugins: [
			buble({objectAssign: 'Object.assign'}),
		],
	})
		.then( bundle => {
			if ( !silent && warnings.count > 0 ) {
				stderr( chalk.bold( `loaded ${relativeId( configFile )} with warnings` ) );
				warnings.flush();
			}

			return bundle.generate({
				format: 'cjs'
			});
		})
		.then( ({ code }) => {
			// temporarily override require
			const defaultLoader = require.extensions[ '.js' ];
			require.extensions[ '.js' ] = ( m, filename ) => {
				if ( filename === configFile ) {
					m._compile( code, filename );
				} else {
					defaultLoader( m, filename );
				}
			};

			delete require.cache[configFile];
			const configs = require( configFile );
			if ( Object.keys( configs ).length === 0 ) {
				handleError({
					code: 'MISSING_CONFIG',
					message: 'Config file must export an options object, or an array of options objects',
					url: 'https://github.com/rollup/rollup/wiki/Command-Line-Interface#using-a-config-file'
				});
			}

			require.extensions[ '.js' ] = defaultLoader;

			return Array.isArray( configs ) ? configs : [configs];
		});
}