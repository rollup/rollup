export default function clone ( node ) {
	if ( !node ) return node;
	if ( typeof node !== 'object' ) return node;

	if ( Array.isArray( node ) ) {
		const cloned = new Array( node.length );
		for ( let i = 0; i < node.length; i += 1 ) cloned[i] = clone( node[i] );
		return cloned;
	}

	const cloned = {};
	for ( const key in node ) {
		cloned[ key ] = clone( node[ key ] );
	}

	return cloned;
}
