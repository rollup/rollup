import minimist from 'minimist';
import help from './help.md';
import { version } from '../../package.json';
import run from './run/index.js';

const command = minimist( process.argv.slice( 2 ), {
	alias: {
		// Aliases
		strict: 'useStrict',

		// Short options
		c: 'config',
		d: 'indent',
		e: 'external',
		f: 'output.format',
		g: 'globals',
		h: 'help',
		i: 'input',
		l: 'legacy',
		m: 'sourcemap',
		n: 'name',
		o: 'output.file',
		v: 'version',
		w: 'watch'
	}
});

if ( command.help || ( process.argv.length <= 2 && process.stdin.isTTY ) ) {
	console.log( `\n${help.replace('__VERSION__', version)}\n` ); // eslint-disable-line no-console
}

else if ( command.version ) {
	console.log( `rollup version ${version}` ); // eslint-disable-line no-console
}

else {
	try {
		require('source-map-support').install();
	} catch (err) {
		// do nothing
	}

	run( command );
}
