function isEqualTest ( node ) {
	return node.type === 'BinaryExpression' && ( node.operator === '===' || node.operator === '==' );
}

function isNotEqualTest ( node ) {
	return node.type === 'BinaryExpression' && ( node.operator === '!==' || node.operator === '!=' );
}

function nodesAreEqual ( a, b ) {
	if ( a.type !== b.type ) return false;
	if ( a.type === 'Literal' ) return a.value === b.value;
	if ( a.type === 'Identifier' ) return a.name === b.name;

	return false;
}

function nodesAreNotEqual ( a, b ) {
	if ( a.type !== b.type ) return false;
	if ( a.type === 'Literal' ) return a.value != b.value;
	if ( a.type === 'Identifier' ) return a.name != b.name;

	return false;
}

export function isTruthy ( node ) {
	if ( node.type === 'Literal' && node.value ) return true;
	if ( node.type === 'ParenthesizedExpression' ) return isTruthy( node.expression );

	if ( isEqualTest( node ) ) return nodesAreEqual( node.left, node.right );
	if ( isNotEqualTest( node ) ) return nodesAreNotEqual( node.left, node.right );

	if ( node.type === 'UnaryExpression' ) {
		if ( node.operator === '!' ) return isFalsy( node.argument );
		return false;
	}

	if ( node.type === 'LogicalExpression' ) {
		if ( node.operator === '&&' ) return isTruthy( node.left ) && isTruthy( node.right );
		if ( node.operator === '||' ) return isTruthy( node.left ) || isTruthy( node.right );
		return false;
	}

	return false;
}

export function isFalsy ( node ) {
	if ( node.type === 'Literal' && !node.value ) return true;
	if ( node.type === 'ParenthesizedExpression' ) return isFalsy( node.expression );

	if ( isEqualTest( node ) ) return nodesAreNotEqual( node.left, node.right );
	if ( isNotEqualTest( node ) ) return nodesAreEqual( node.left, node.right );

	if ( node.type === 'UnaryExpression' ) {
		if ( node.operator === '!' ) return isTruthy( node.argument );
		return false;
	}

	if ( node.type === 'LogicalExpression' ) {
		if ( node.operator === '&&' ) return isFalsy( node.left ) || isFalsy( node.right );
		if ( node.operator === '||' ) return isFalsy( node.left ) && isFalsy( node.right );
		return false;
	}

	return false;
}
