import { ExecutionPathOptions } from '../ExecutionPathOptions';
import { EMPTY_PATH, ObjectPath, UNKNOWN_EXPRESSION } from '../values';
import * as NodeType from './NodeType';
import { ExpressionEntity } from './shared/Expression';
import { NodeBase } from './shared/Node';
import { PatternNode } from './shared/Pattern';

export default class ArrayPattern extends NodeBase implements PatternNode {
	type: NodeType.tArrayPattern;
	elements: (PatternNode | null)[];

	declare(kind: string, _init: ExpressionEntity) {
		for (const element of this.elements) {
			if (element !== null) {
				element.declare(kind, UNKNOWN_EXPRESSION);
			}
		}
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, options: ExecutionPathOptions) {
		if (path.length > 0) return true;
		for (const element of this.elements) {
			if (element !== null && element.hasEffectsWhenAssignedAtPath(EMPTY_PATH, options))
				return true;
		}
		return false;
	}

	deoptimizePath(path: ObjectPath) {
		if (path.length === 0) {
			for (const element of this.elements) {
				if (element !== null) {
					element.deoptimizePath(path);
				}
			}
		}
	}
}
