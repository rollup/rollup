#!/usr/bin/env node

var minimist = require( 'minimist' ),
	command;

command = minimist( process.argv.slice( 2 ), {
	alias: {
		i: 'input',
		o: 'output',
		v: 'version',
		h: 'help',
		f: 'format',
		m: 'sourcemap',
		n: 'name',
		u: 'id'
	}
});

if ( command.help || ( process.argv.length <= 2 && process.stdin.isTTY ) ) {
	require( './showHelp' )();
}

else if ( command.version ) {
	console.log( 'rollup version ' + require( '../package.json' ).version );
}

else {
	require( './runRollup' )( command );
}
