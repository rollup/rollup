import minimist from 'minimist';
import help from './help.md';
import { version } from '../../package.json';
import runRollup from './runRollup';

const command = minimist( process.argv.slice( 2 ), {
	alias: {
		// Aliases
		strict: 'useStrict',

		// Short options
		c: 'config',
		d: 'indent',
		e: 'external',
		f: 'format',
		g: 'globals',
		h: 'help',
		i: 'input',
		m: 'sourcemap',
		n: 'name',
		o: 'output',
		u: 'id',
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
	runRollup( command );
}
