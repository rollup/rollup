import ExecutionPathOptions from '../ExecutionPathOptions';
import { ObjectPath } from '../variables/VariableReassignmentTracker';
import { ExpressionBase, ExpressionNode } from './shared/Expression';
import { PatternNode } from './shared/Pattern';

export default class AssignmentExpression extends ExpressionBase {
	type: 'AssignmentExpression';
	left: PatternNode | ExpressionNode;
	right: ExpressionNode;

	bindNode () {
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
