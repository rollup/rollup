import chalk from 'chalk';
import relativeId from '../../src/utils/relativeId.js';

if ( !process.stderr.isTTY ) chalk.enabled = false;
const warnSymbol = process.stderr.isTTY ? `⚠️   ` : `Warning: `;
const errorSymbol = process.stderr.isTTY ? `🚨   ` : `Error: `;

// log to stderr to keep `rollup main.js > bundle.js` from breaking
export const stderr = console.error.bind( console ); // eslint-disable-line no-console

function log ( object, symbol ) {
	let description = object.message || object;
	if (object.name) description = object.name + ': ' + description;
	const message = (object.plugin ? `(${object.plugin} plugin) ${description}` : description) || object;;

	stderr( `${symbol}${chalk.bold( message )}` );

  // TODO should this be "object.url || (object.file && object.loc.file) || object.id"?
	if ( object.url ) {
		stderr( chalk.cyan( object.url ) );
	}

	if ( object.loc ) {
		stderr( `${relativeId( object.loc.file || object.id )} (${object.loc.line}:${object.loc.column})` );
	} else if ( object.id ) {
		stderr( relativeId( object.id ) );
	}

	if ( object.frame ) {
		stderr( chalk.dim( object.frame ) );
	}

	stderr( '' );
}

export function handleWarning ( warning ) {
	log( warning, warnSymbol );
}

export function handleError ( err, recover ) {
	log( err, errorSymbol );
	if ( !recover ) process.exit( 1 );
}
