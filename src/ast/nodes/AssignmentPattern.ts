import ExecutionPathOptions from '../ExecutionPathOptions';
import { PatternNode } from './shared/Pattern';
import { ExpressionEntity } from './shared/Expression';
import { ExpressionNode, NodeBase } from './shared/Node';
import * as NodeType from './NodeType';
import { ObjectPath } from '../values';

export default class AssignmentPattern extends NodeBase implements PatternNode {
	type: NodeType.tAssignmentPattern;
	left: PatternNode;
	right: ExpressionNode;

	bind() {
		super.bind();
		this.left.reassignPath([], ExecutionPathOptions.create());
	}

	declare(kind: string, init: ExpressionEntity | null) {
		this.left.declare(kind, init);
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, options: ExecutionPathOptions): boolean {
		return path.length > 0 || this.left.hasEffectsWhenAssignedAtPath([], options);
	}

	reassignPath(path: ObjectPath, options: ExecutionPathOptions) {
		path.length === 0 && this.left.reassignPath(path, options);
	}
}
