export function isTruthy ( node ) {
	if ( node.type === 'Literal' ) return !!node.value;
	if ( node.type === 'ParenthesizedExpression' ) return isTruthy( node.expression );
	if ( node.operator in operators ) return operators[ node.operator ]( node );
}

export function isFalsy ( node ) {
	return not( isTruthy( node ) );
}

function not ( value ) {
	return value === undefined ? value : !value;
}

function equals ( a, b, strict ) {
	if ( a.type !== b.type ) return undefined;
	if ( a.type === 'Literal' ) return strict ? a.value === b.value : a.value == b.value;
}

const operators = {
	'==': x => {
		return equals( x.left, x.right, false );
	},

	'!=': x => not( operators['==']( x ) ),

	'===': x => {
		return equals( x.left, x.right, true );
	},

	'!==': x => not( operators['===']( x ) ),

	'!': x => isFalsy( x.argument ),

	'&&': x => isTruthy( x.left ) && isTruthy( x.right ),

	'||': x => isTruthy( x.left ) || isTruthy( x.right )
};
