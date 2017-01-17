const validProp = /^[a-zA-Z_$][a-zA-Z_$0-9]*$/;

export default function flatten ( node ) {
	const keypath = node.toString(); // TODO is this the best way?
	const parts = [];

	while ( node.type === 'MemberExpression' ) {
		if ( node.computed ) {
			if ( node.type !== 'Literal' || typeof node.value !== 'string' || !validProp.test( node.value ) ) {
				return null;
			}
		}
		parts.unshift( node.property );

		node = node.object;
	}

	const root = node;
	let name;

	if ( root.type === 'Identifier' ) {
		name = root.name;
	} else if ( root.type === 'ThisExpression' ) {
		name = 'this';
	} else if ( root.type === 'Super' ) {
		name = 'super';
	} else {
		return null;
	}

	parts.unshift( root );

	return { root, name, parts, keypath };
}
