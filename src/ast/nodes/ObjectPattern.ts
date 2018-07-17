import { ExecutionPathOptions } from '../ExecutionPathOptions';
import { EMPTY_PATH, ObjectPath } from '../values';
import * as NodeType from './NodeType';
import Property from './Property';
import RestElement from './RestElement';
import { ExpressionEntity } from './shared/Expression';
import { NodeBase } from './shared/Node';
import { PatternNode } from './shared/Pattern';

export default class ObjectPattern extends NodeBase implements PatternNode {
	type: NodeType.tObjectPattern;
	properties: (Property | RestElement)[];

	declare(kind: string, init: ExpressionEntity) {
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

	deoptimizePath(path: ObjectPath) {
		if (path.length === 0) {
			for (const property of this.properties) {
				property.deoptimizePath(path);
			}
		}
	}
}
