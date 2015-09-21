export function readdirSync () {
	throw new Error( 'Cannot use sander.readdirSync inside browser' );
}

export function readFile () {
	throw new Error( 'Cannot use sander.readFile inside browser' );
}

export function readFileSync () {
	throw new Error( 'Cannot use sander.readFileSync inside browser' );
}

export function writeFile () {
	throw new Error( 'Cannot use sander.writeFile inside browser' );
}

export const Promise = window.Promise;
