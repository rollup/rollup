import ExecutionPathOptions from '../ExecutionPathOptions';
import { PatternNode } from './shared/Pattern';
import { ExpressionNode, NodeBase } from './shared/Node';
import * as NodeType from './NodeType';
import { ObjectPath, UNKNOWN_KEY } from '../values';

export default class AssignmentExpression extends NodeBase {
	type: NodeType.tAssignmentExpression;
	left: PatternNode | ExpressionNode;
	right: ExpressionNode;

	bind() {
		super.bind();
		this.left.reassignPath([], ExecutionPathOptions.create());
		// We can not propagate mutations of the new binding to the old binding with certainty
		this.right.reassignPath([UNKNOWN_KEY], ExecutionPathOptions.create());
	}

	hasEffects(options: ExecutionPathOptions): boolean {
		return (
			this.right.hasEffects(options) ||
			this.left.hasEffects(options) ||
			this.left.hasEffectsWhenAssignedAtPath([], options)
		);
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, options: ExecutionPathOptions): boolean {
		return path.length > 0 && this.right.hasEffectsWhenAccessedAtPath(path, options);
	}
}
