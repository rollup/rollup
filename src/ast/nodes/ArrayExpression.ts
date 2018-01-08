import SpreadElement from './SpreadElement';
import { ObjectPath } from '../variables/VariableReassignmentTracker';
import { ExpressionBase, ExpressionNode } from './shared/Expression';

export default class ArrayExpression extends ExpressionBase {
	type: 'ArrayExpression';
	elements: (ExpressionNode | SpreadElement | null)[];

	hasEffectsWhenAccessedAtPath (path: ObjectPath) {
		return path.length > 1;
	}
}
