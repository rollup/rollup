import Promise from 'es6-promise/lib/es6-promise/promise';
import * as fs from 'fs';

export function writeFile ( dest, data ) {
	return new Promise( ( fulfil, reject ) => {
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
