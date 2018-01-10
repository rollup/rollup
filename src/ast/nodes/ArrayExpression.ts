import SpreadElement from './SpreadElement';
import { ObjectPath } from '../variables/VariableReassignmentTracker';
import { ExpressionNode, NodeBase } from './shared/Node';
import { NodeType } from './index';

export default class ArrayExpression extends NodeBase {
	type: NodeType.ArrayExpression;
	elements: (ExpressionNode | SpreadElement | null)[];

	hasEffectsWhenAccessedAtPath (path: ObjectPath) {
		return path.length > 1;
	}
}
