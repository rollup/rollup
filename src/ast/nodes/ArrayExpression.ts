import SpreadElement from './SpreadElement';
import { ObjectPath } from '../variables/VariableReassignmentTracker';
import { GenericExpressionNode, ExpressionNode } from './shared/Expression';

export default class ArrayExpression extends GenericExpressionNode {
	type: 'ArrayExpression';
	elements: (ExpressionNode | SpreadElement | null)[];

	hasEffectsWhenAccessedAtPath (path: ObjectPath) {
		return path.length > 1;
	}
}
