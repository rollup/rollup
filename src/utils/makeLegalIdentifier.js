export default function makeLegalIdentifier ( str ) {
	str = str.replace( /[^$_a-zA-Z0-9]/g, '_' );
	if ( /\d/.test( str[0] ) ) str = `_${str}`;

	return str;
}