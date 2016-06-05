import Promise from 'es6-promise/lib/es6-promise/promise.js';
import * as fs from 'fs';
import { dirname } from './path.js';

function readdir ( dir ) {
	return new Promise( ( fulfil, reject ) => {
		fs.readdir( dir, ( err ) => {
			if ( err ) {
				reject( err );
			} else {
				fulfil();
			}
		});
	});
}

function mkdir ( dir ) {
	return new Promise( ( fulfil, reject ) => {
		fs.mkdir( dir, ( err ) => {
			if ( err ) {
				reject( err );
			} else {
				fulfil();
			}
		});
	});
}

function mkdirpath ( path ) {
	const dir = dirname( path );
	return readdir( dir ).catch( () => {
		return mkdirpath( dir ).then( () => {
			return mkdir( dir ).catch( e => {
				// race condition
				if (e && e.code === 'EEXIST') {
					return;
				}
				throw e;
			});
		});
	});
}

export function isFile ( file ) {
	return new Promise( ( fulfil ) => {
		fs.stat( file, ( err, stats ) => {
			if ( err ) {
				fulfil( false );
			} else {
				fulfil( stats.isFile() );
			}
		});
	});
}

export function writeFile ( dest, data ) {
	return mkdirpath( dest ).then( ()=> {
		return new Promise( ( fulfil, reject ) => {

			fs.writeFile( dest, data, err => {
				if ( err ) {
					reject( err );
				} else {
					fulfil();
				}
			});
		});
	});
}
export function readFile ( id, enc ) {
	return new Promise( ( fulfil, reject ) => {
		fs.readFile( id, enc, ( err, data ) => {
			if ( err ) {
				reject( err );
			} else {
				fulfil( data );
			}
		});
	});
}
