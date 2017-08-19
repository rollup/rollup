import * as rollup from 'rollup';
import chalk from 'chalk';
import ms from 'pretty-ms';
import { handleError, stderr } from '../logging.js';
import relativeId from '../../../src/utils/relativeId.js';
import { mapSequence } from '../../../src/utils/promise.js';
import SOURCEMAPPING_URL from '../sourceMappingUrl.js';

export default function build ( options, warnings, silent ) {
	const useStdout = !options.targets && !options.output;
	const targets = options.targets ? options.targets : [{ output: options.output, format: options.format }];

	const start = Date.now();
	const dests = useStdout ? [ 'stdout' ] : targets.map( t => relativeId( t.output ) );
	if ( !silent ) stderr( chalk.cyan( `\n${chalk.bold( options.input )} → ${chalk.bold( dests.join( ', ' ) )}...` ) );

	return rollup.rollup( options )
		.then( bundle => {
			if ( useStdout ) {
				if ( options.sourcemap && options.sourcemap !== 'inline' ) {
					handleError({
						code: 'MISSING_OUTPUT_OPTION',
						message: 'You must specify an --output (-o) option when creating a file with a sourcemap'
					});
				}

				return bundle.generate(options).then( ({ code, map }) => {
					if ( options.sourcemap === 'inline' ) {
						code += `\n//# ${SOURCEMAPPING_URL}=${map.toUrl()}\n`;
					}

					process.stdout.write( code );
				});
			}

			return mapSequence( targets, target => {
				return bundle.write( assign( clone( options ), target ) );
			});
		})
		.then( () => {
			warnings.flush();
			if ( !silent ) stderr( chalk.green( `created ${chalk.bold( dests.join( ', ' ) )} in ${chalk.bold(ms( Date.now() - start))}` ) );
		})
		.catch( handleError );
}

function clone ( object ) {
	return assign( {}, object );
}

function assign ( target, source ) {
	Object.keys( source ).forEach( key => {
		target[ key ] = source[ key ];
	});
	return target;
}