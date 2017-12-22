import Node from '../Node';
import disallowIllegalReassignment from './shared/disallowIllegalReassignment';
import ExecutionPathOptions from '../ExecutionPathOptions';
import Pattern from './Pattern';
import Expression from './Expression';
import { ObjectPath } from '../variables/VariableReassignmentTracker';

export default class AssignmentExpression extends Node {
	type: 'AssignmentExpression';
	left: Pattern | Expression;
	right: Expression;

	bindNode () {
		disallowIllegalReassignment(this.scope, this.left);
		this.left.reassignPath([], ExecutionPathOptions.create());
	}

	hasEffects (options: ExecutionPathOptions): boolean {
		return (
			super.hasEffects(options) ||
			this.left.hasEffectsWhenAssignedAtPath([], options)
		);
	}

	hasEffectsWhenAccessedAtPath (path: ObjectPath, options: ExecutionPathOptions): boolean {
		return (
			path.length > 0 && this.right.hasEffectsWhenAccessedAtPath(path, options)
		);
	}
}
