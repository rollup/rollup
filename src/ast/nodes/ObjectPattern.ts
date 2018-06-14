import { ExecutionPathOptions } from '../ExecutionPathOptions';
import { EMPTY_PATH, ObjectPath } from '../values';
import AssignmentProperty from './AssignmentProperty';
import * as NodeType from './NodeType';
import { ExpressionEntity } from './shared/Expression';
import { NodeBase } from './shared/Node';
import { PatternNode } from './shared/Pattern';

export default class ObjectPattern extends NodeBase implements PatternNode {
	type: NodeType.tObjectPattern;
	properties: AssignmentProperty[];

	declare(kind: string, init: ExpressionEntity | null) {
		for (const property of this.properties) {
			property.declare(kind, init);
		}
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, options: ExecutionPathOptions) {
		if (path.length > 0) return true;
		for (const property of this.properties) {
			if (property.hasEffectsWhenAssignedAtPath(EMPTY_PATH, options)) return true;
		}
		return false;
	}

	reassignPath(path: ObjectPath) {
		if (path.length === 0) {
			for (const property of this.properties) {
				property.reassignPath(path);
			}
		}
	}
}
