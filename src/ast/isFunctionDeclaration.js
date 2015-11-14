export default function isFunctionDeclaration ( node ) {
	if ( !node ) return false;

	return node.type === 'FunctionDeclaration' ||
		( node.type === 'VariableDeclaration' && node.init && /FunctionExpression/.test( node.init.type ) );
}
