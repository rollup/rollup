import ExecutionPathOptions from '../ExecutionPathOptions';
import { ObjectPath } from '../variables/VariableReassignmentTracker';
import { PatternNode } from './shared/Pattern';
import { ExpressionNode, NodeBase } from './shared/Node';
import { NodeType } from './index';

export default class AssignmentExpression extends NodeBase {
	type: NodeType.AssignmentExpression;
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
