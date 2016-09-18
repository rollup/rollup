import { UNKNOWN } from '../../values.js';

export default function isUsedByBundle ( scope, node ) {
	while ( node.type === 'ParenthesizedExpression' ) node = node.expression;

	// TODO do we need to distinguish between assignments and mutations somehow?
	if ( node.type === 'MemberExpression' ) node = node.object;

	const values = new Set();
	node.gatherPossibleValues( values );
	for ( const value of values ) {
		if ( value === UNKNOWN ) {
			return true;
		}

		if ( value.type === 'Identifier' ) {
			if ( value.declaration.activated ) {
				return true;
			}
			value.declaration.gatherPossibleValues( values );
		}

		else if ( value.gatherPossibleValues ) {
			value.gatherPossibleValues( values );
		}
	}

	return false;
}
