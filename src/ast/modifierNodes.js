const modifierNodes = {
	AssignmentExpression: 'left',
	UpdateExpression: 'argument',
	UnaryExpression: 'argument'
};

export default modifierNodes;

export function isModifierNode ( node ) {
	if ( !( node.type in modifierNodes ) ) {
		return false;
	}

	if ( node.type === 'UnaryExpression' ) {
		return node.operator === 'delete';
	}

	return true;
}
