import disallowIllegalReassignment from './shared/disallowIllegalReassignment';
import ExecutionPathOptions from '../ExecutionPathOptions';
import { ObjectPath } from '../variables/VariableReassignmentTracker';
import { BasicExpressionNode, ExpressionNode } from './shared/Expression';
import { PatternNode } from './shared/Pattern';

export default class AssignmentExpression extends BasicExpressionNode {
	type: 'AssignmentExpression';
	left: PatternNode | ExpressionNode;
	right: ExpressionNode;

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
