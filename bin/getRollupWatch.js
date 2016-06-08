var chalk = require( 'chalk' );
var relative = require( 'require-relative' );

module.exports = function getRollupWatch () {
	try {
		watch = relative( 'rollup-watch', process.cwd() );
		return Promise.resolve( watch );
	} catch ( err ) {
		if ( err.code === 'MODULE_NOT_FOUND' ) {
			return installRollupWatch().then( () => {
				return relative( 'rollup-watch', process.cwd() );
			});
		} else {
			return Promise.reject( err );
		}
	}
};

function installRollupWatch () {
	console.error( 'rollup --watch depends on the rollup-watch package, which could not be found. You can install it globally with ' + chalk.cyan( 'npm install -g rollup-watch' ) + '. Do this now? ' + chalk.green.bold( '[y/n]' ) );

	process.stdin.setEncoding( 'utf8' );

	return new Promise( ( fulfil, reject ) => {
		process.stdin.on( 'readable', function () {
			var chunk = process.stdin.read();
			if ( !chunk ) return;

			if ( /^y(?:es)?$/i.test( chunk ) ) {
				console.error( 'installing rollup-watch...' );
				child = require( 'child_process' ).exec( 'npm install --global rollup-watch', err => {
					if ( err ) {
						reject( err );
					} else {
						fulfil();
					}
				});
			} else {
				reject( new Error( 'aborted' ) );
			}
		});
	});
}
