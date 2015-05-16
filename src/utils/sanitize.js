export default function sanitize ( name ) {
	name = name.replace( /[^$_0-9a-zA-Z]/g, '_' );
	if ( !/[$_a-zA-Z]/.test( name ) ) name = `_${name}`;

	return name;
}