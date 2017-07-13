import * as rollup from 'rollup';
import { handleError } from '../logging.js';
import SOURCEMAPPING_URL from '../sourceMappingUrl.js';

export default function build ( options ) {
	return rollup.rollup( options )
		.then( bundle => {
			if ( options.dest ) {
				return bundle.write( options );
			}

			if ( options.targets ) {
				let result = null;

				options.targets.forEach( target => {
					result = bundle.write( assign( clone( options ), target ) );
				});

				return result;
			}

			if ( options.sourceMap && options.sourceMap !== 'inline' ) {
				handleError({
					code: 'MISSING_OUTPUT_OPTION',
					message: 'You must specify an --output (-o) option when creating a file with a sourcemap'
				});
			}

			return bundle.generate(options).then( ({ code, map }) => {
				if ( options.sourceMap === 'inline' ) {
					code += `\n//# ${SOURCEMAPPING_URL}=${map.toUrl()}\n`;
				}

				process.stdout.write( code );
			});
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