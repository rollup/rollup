import { ExecutionPathOptions } from '../ExecutionPathOptions';
import { EMPTY_PATH, ObjectPath, UNKNOWN_PATH } from '../values';
import * as NodeType from './NodeType';
import { ExpressionEntity } from './shared/Expression';
import { ExpressionNode, NodeBase } from './shared/Node';
import { PatternNode } from './shared/Pattern';

export default class AssignmentPattern extends NodeBase implements PatternNode {
	type: NodeType.tAssignmentPattern;
	left: PatternNode;
	right: ExpressionNode;

	bind() {
		super.bind();
		this.left.deoptimizePath(EMPTY_PATH);
		this.right.deoptimizePath(UNKNOWN_PATH);
	}

	declare(kind: string, init: ExpressionEntity) {
		this.left.declare(kind, init);
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, options: ExecutionPathOptions): boolean {
		return path.length > 0 || this.left.hasEffectsWhenAssignedAtPath(EMPTY_PATH, options);
	}

	deoptimizePath(path: ObjectPath) {
		path.length === 0 && this.left.deoptimizePath(path);
	}
}
