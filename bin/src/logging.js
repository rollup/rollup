import chalk from 'chalk';
import relativeId from '../../src/utils/relativeId.js';

if ( !process.stderr.isTTY ) chalk.enabled = false;
const warnSymbol = process.stderr.isTTY ? `⚠️   ` : `Warning: `;
const errorSymbol = process.stderr.isTTY ? `🚨   ` : `Error: `;

// log to stderr to keep `rollup main.js > bundle.js` from breaking
export const stderr = console.error.bind( console ); // eslint-disable-line no-console

export function handleWarning ( warning ) {
	stderr( `${warnSymbol}${chalk.bold( warning.message )}` );

	if ( warning.url ) {
		stderr( chalk.cyan( warning.url ) );
	}

	if ( warning.loc ) {
		stderr( `${relativeId( warning.loc.file )} (${warning.loc.line}:${warning.loc.column})` );
	}

	if ( warning.frame ) {
		stderr( chalk.dim( warning.frame ) );
	}

	stderr( '' );
}

export function handleError ( err, recover ) {
	stderr( `${errorSymbol}${chalk.bold( err.message )}` );

	if ( err.url ) {
		stderr( chalk.cyan( err.url ) );
	}

	if ( err.loc ) {
		stderr( `${relativeId( err.loc.file )} (${err.loc.line}:${err.loc.column})` );
	}

	if ( err.frame ) {
		stderr( chalk.dim( err.frame ) );
	}

	stderr( '' );

	if ( !recover ) process.exit( 1 );
}
