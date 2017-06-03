export default function isProgramLevel ( node ) {
	do {
		if ( node.type === 'Program' ) {
			return true;
		}
		node = node.parent;
	} while ( node && !/Function/.test( node.type ) );

	return false;
}
