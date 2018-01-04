import { ObjectPath } from '../../variables/VariableReassignmentTracker';
import { BasicExpressionNode } from './Expression';

// TODO Lukas change to static value instead
export default class VirtualObjectExpression extends BasicExpressionNode {
	hasEffectsWhenAccessedAtPath (path: ObjectPath) {
		return path.length > 1;
	}

	hasEffectsWhenAssignedAtPath (path: ObjectPath) {
		return path.length > 1;
	}

	toString () {
		return '[[VIRTUAL OBJECT]]';
	}
}
