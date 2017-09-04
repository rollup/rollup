// TODO tidy this up a bit (e.g. they can both use node.module.imports)
export default function disallowIllegalReassignment ( scope, node ) {
	if ( node.type === 'MemberExpression' && node.object.type === 'Identifier' ) {
		const variable = scope.findVariable( node.object.name );
		if ( variable.isNamespace ) {
			node.module.error({
				code: 'ILLEGAL_NAMESPACE_REASSIGNMENT',
				message: `Illegal reassignment to import '${node.object.name}'`
			}, node.start );
		}
	}

	else if ( node.type === 'Identifier' ) {
		if ( node.module.imports[ node.name ] && !scope.contains( node.name ) ) {
			node.module.error({
				code: 'ILLEGAL_REASSIGNMENT',
				message: `Illegal reassignment to import '${node.name}'`
			}, node.start );
		}
	}
}
