export default function isReference ( node, parent ) {
	if ( node.type === 'MemberExpression' ) {
		return !node.computed && isReference( node.object, node );
	}

	if ( node.type === 'Identifier' ) {
		// TODO is this right?
		if ( parent.type === 'MemberExpression' ) return parent.computed || node === parent.object;

		// disregard the `bar` in { bar: foo }
		if ( parent.type === 'Property' && node !== parent.value ) return false;

		// disregard the `bar` in `class Foo { bar () {...} }`
		if ( parent.type === 'MethodDefinition' ) return false;

		// disregard the `bar` in `export { foo as bar }`
		if ( parent.type === 'ExportSpecifier' && node !== parent.local ) return;

		return true;
	}
}
