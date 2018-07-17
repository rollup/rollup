import { ExecutionPathOptions } from '../ExecutionPathOptions';
import { EMPTY_PATH, ObjectPath, UNKNOWN_PATH } from '../values';
import * as NodeType from './NodeType';
import { ExpressionNode, NodeBase } from './shared/Node';
import { PatternNode } from './shared/Pattern';

export default class AssignmentExpression extends NodeBase {
	type: NodeType.tAssignmentExpression;
	operator:
		| '='
		| '+='
		| '-='
		| '*='
		| '/='
		| '%='
		| '<<='
		| '>>='
		| '>>>='
		| '|='
		| '^='
		| '&='
		| '**=';
	left: PatternNode | ExpressionNode;
	right: ExpressionNode;

	bind() {
		super.bind();
		this.left.deoptimizePath(EMPTY_PATH);
		// We cannot propagate mutations of the new binding to the old binding with certainty
		this.right.deoptimizePath(UNKNOWN_PATH);
	}

	hasEffects(options: ExecutionPathOptions): boolean {
		return (
			this.right.hasEffects(options) ||
			this.left.hasEffects(options) ||
			this.left.hasEffectsWhenAssignedAtPath(EMPTY_PATH, options)
		);
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, options: ExecutionPathOptions): boolean {
		return path.length > 0 && this.right.hasEffectsWhenAccessedAtPath(path, options);
	}
}
