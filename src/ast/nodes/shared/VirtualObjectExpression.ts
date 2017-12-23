import Node from '../../Node';
import { ObjectPath } from '../../variables/VariableReassignmentTracker';

export default class VirtualObjectExpression extends Node {
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
