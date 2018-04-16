import { ObjectPath, UNKNOWN_EXPRESSION } from '../values';
import ExecutionPathOptions from '../ExecutionPathOptions';
import { PatternNode } from './shared/Pattern';
import { ExpressionEntity } from './shared/Expression';
import { NodeBase } from './shared/Node';
import { NodeType } from './NodeType';

export default class ArrayPattern extends NodeBase implements PatternNode {
	type: NodeType.ArrayPattern;
	elements: (PatternNode | null)[];

	declare(kind: string, _init: ExpressionEntity | null) {
		for (const element of this.elements) {
			if (element !== null) {
				element.declare(kind, UNKNOWN_EXPRESSION);
			}
		}
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, options: ExecutionPathOptions) {
		if (path.length > 0) return true;
		for (const element of this.elements) {
			if (element !== null && element.hasEffectsWhenAssignedAtPath([], options)) return true;
		}
		return false;
	}

	reassignPath(path: ObjectPath, options: ExecutionPathOptions) {
		if (path.length === 0) {
			for (const element of this.elements) {
				if (element !== null) {
					element.reassignPath(path, options);
				}
			}
		}
	}
}
