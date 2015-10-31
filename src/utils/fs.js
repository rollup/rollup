import Promise from 'es6-promise/lib/es6-promise/promise.js';
import * as fs from 'fs';
import { dirname } from './path.js';

function mkdirpath ( path ) {
	const dir = dirname( path );
	try {
		fs.readdirSync( dir );
	} catch ( err ) {
		mkdirpath( dir );
		fs.mkdirSync( dir );
	}
}

export function isFile ( file ) {
	try {
		const stats = fs.statSync( file );
		return stats.isFile();
	} catch ( err ) {
		return false;
	}
}

export function writeFile ( dest, data ) {
	return new Promise( ( fulfil, reject ) => {
		mkdirpath( dest );

		fs.writeFile( dest, data, err => {
			if ( err ) {
				reject( err );
			} else {
				fulfil();
			}
		});
	});
}

export const readdirSync = fs.readdirSync;
export const readFileSync = fs.readFileSync;
