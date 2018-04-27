import { ObjectPath, UNKNOWN_EXPRESSION } from '../values';
import ExecutionPathOptions from '../ExecutionPathOptions';
import { PatternNode } from './shared/Pattern';
import { ExpressionEntity } from './shared/Expression';
import { NodeBase } from './shared/Node';
import * as NodeType from './NodeType';

export default class RestElement extends NodeBase implements PatternNode {
	type: NodeType.tRestElement;
	argument: PatternNode;

	declare(kind: string, _init: ExpressionEntity | null) {
		this.argument.declare(kind, UNKNOWN_EXPRESSION);
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, options: ExecutionPathOptions): boolean {
		return path.length > 0 || this.argument.hasEffectsWhenAssignedAtPath([], options);
	}

	reassignPath(path: ObjectPath, options: ExecutionPathOptions) {
		path.length === 0 && this.argument.reassignPath([], options);
	}
}
