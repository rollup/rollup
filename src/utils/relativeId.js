export default function relativeId ( id ) {
	if ( typeof process === 'undefined' ) return id;
	return id.replace( process.cwd(), '' ).replace( /^[\/\\]/, '' );
}
