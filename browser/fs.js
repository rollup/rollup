export function readdirSync () {
	throw new Error( 'Cannot use fs.readdirSync inside browser' );
}

export function readFileSync () {
	throw new Error( 'Cannot use fs.readFileSync inside browser' );
}

export function writeFile () {
	throw new Error( 'Cannot use fs.writeFile inside browser' );
}

export const Promise = window.Promise;
