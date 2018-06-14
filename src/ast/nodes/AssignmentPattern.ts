import { ExecutionPathOptions } from '../ExecutionPathOptions';
import { EMPTY_PATH, ObjectPath } from '../values';
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
		this.left.reassignPath(EMPTY_PATH);
	}

	declare(kind: string, init: ExpressionEntity | null) {
		this.left.declare(kind, init);
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, options: ExecutionPathOptions): boolean {
		return path.length > 0 || this.left.hasEffectsWhenAssignedAtPath(EMPTY_PATH, options);
	}

	reassignPath(path: ObjectPath) {
		path.length === 0 && this.left.reassignPath(path);
	}
}
