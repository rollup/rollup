import relative from 'require-relative';
import handleError from './handleError.js';

export default function () {
	try {
		const init = relative( 'rollup-init', process.cwd() );
		init( process.cwd() );
	} catch ( err ) {
		if ( err.code === 'MODULE_NOT_FOUND' ) {
			err.code = 'ROLLUP_INIT_NOT_INSTALLED';
		}

		handleError( err );
	}
}
